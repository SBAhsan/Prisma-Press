import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const port = config.port;

async function main(){
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully");
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.error("Error starting the server", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();