require("dotenv").config();

const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const {WebSocketServer} = require("ws");    
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const cors  = require("cors");
const {PrismaClient} = require("@prisma/client");
const cookie = require("cookie");

// Initialize Prisma ORM client for database operations
const prisma = new PrismaClient();

// Create Express app for REST endpoints
const app = express();

app.use(cookieParser());

app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8081"
]

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Rate-limit login endpoint to 20 requests per minute per IP
app.use("/login", rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many requests, please try again later."
}))

// Looks up or creates a user, then returns a signed JWT.
app.post("/login", async (req, res) => {
    const {name} = req.body;
    // Bad request if no name provided
    if(!name) return res.status(400).json({message: "Name is required."})
    
        // Try to find existing user by name (should be unique in DB)
    let user = await prisma.user.findUnique({where: {name}});
    if(!user){
        // If not found, create new user record
        user = await prisma.user.create({data: {name}});
    }

    // Sign a JWT that includes userId and username, expires in 1 day
    const token = jwt.sign({userId: user.id, username: user.name}, process.env.JWT_SECRET, {expiresIn: "1d"});

    res.cookie("token", token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
    })
    // Send the token back to the client
    res.json({apruved: true,});
});

app.get("/auth", (req, res) =>{
    const token = req.cookies.token;

    if(!token) return res.json({auth: false});

    // Verify JWT token from client
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({auth: true, username: jwt.decode(token).username, userId: jwt.decode(token).userId});
    } catch(e){
        return res.json({auth: false});
    }
})

// Returns all chat messages, newest first, including author relation
app.get("/messages", async (req, res) => {
    const token = req.cookies.token;

    if(!token) return res.status(401).json({message: "Unauthorized"});

    // Verify JWT token from client
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        const msgs = await prisma.message.findMany(
            {
                include:{author: true},
                orderBy: {
                    creation_date: "desc"
                }
            }
        );
        return res.json(msgs);
    } catch(e){
        return res.status(401).json({message: "Unauthorized"});
    }
});

// Create HTTP server and attach Express app
const server = http.createServer(app);

// Initialize WebSocket server on the same HTTP server
const wss = new WebSocketServer({server});

// Map to store connection state: key = username, value = online boolean
const UserStatus = new Map();

// Handle new WebSocket connections
wss.on("connection", (ws, request) => { 

    const rawCookies = request.headers.cookie || "";
    const cookies = cookie.parse(rawCookies);
    const token = cookies.token;

    if(!token){
        ws.send(JSON.stringify({type: "error", message:"Unauthorized"}));
        return ws.close();
    }
    
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const {username} = payload;
        ws.username = username;
        UserStatus.set(username, true);
        broadcastUsers();
    }catch{
        ws.send(JSON.stringify({type: "error", message:"Unauthorized"}));
        return ws.close();
    }
    

    ws.on("message", async raw =>{
        const data = JSON.parse(raw);

        // Handle new chat message request
        if(data.type === "message"){
            // Find the user record by username from payload
            const user = await prisma.user.findUnique({where: {name: data.username}});

            // Create new message in database, connecting to author by ID
            const newMessage = await prisma.message.create({
                data: {content: data.content, author: {connect: {id: user.id}}},
                include: {author: true}
            })
            
            // Broadcast the new message to all connected clients
            broadcast({type: "newMessage", message: newMessage});
        }

        // Handle like/unlike events
        if(data.type === "like" || data.type === "unlike"){
            const {messageId, likedBy: username} = data;
            // Fetch the message record to read its current likedBy array
            const message = await prisma.message.findUnique({where: {id: messageId}});
            const currentLikedBy = message.likedBy || [];
            let newLikedBy;

            if(data.type === "like"){
                // Add user to likedBy list 
                newLikedBy = Array.from(new Set([...currentLikedBy, username]));
            }else{
                // Remove user from likedBy list
                newLikedBy = currentLikedBy.filter(u => u !== username);
            }

            // Update the message record in DB with new likes count and list
            const updateLikes = await prisma.message.update({
                where: {id: messageId},
                data: {likes: newLikedBy.length, likedBy: { set: newLikedBy}}
            });

            // Broadcast updated like info to clients
            broadcast({type: "updateLike", messageId: data.messageId, likes: updateLikes.likes, likedBy: updateLikes.likedBy});

        }
    })

    // Handle socket close event and mark user as offline
    ws.on("close", () => {
            if(ws.username){
                UserStatus.set(ws.username, false);
                broadcastUsers();
            }
        })

})

// Broadcast a payload to all connected WebSocket clients
function broadcast(playload){
    const str = JSON.stringify(playload);
    wss.clients.forEach(client => {
        if(client.readyState === 1){
            client.send(str);
        }
    })
}

// Collect current user statuses and broadcast as 'users' message
function broadcastUsers(){;
    const users = Array.from(UserStatus.entries());
    broadcast({type: "users", data: users});
}

// Start HTTP + WebSocket server 
server.listen(4000, () => console.log("Server is running on port 4000")); 