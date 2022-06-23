import {ClientEvent} from "../interfaces";
import {
    eventHandler,
    EXECUTE_CYCLE_OFFSET
} from "../index";
import {RoomHandler} from "./room-handler";

export function startExpressServer(httpServer, app, io) {
    app.post('/event', async (req, res) => {
        const event: ClientEvent = req.body;
        const roomID: string = req.query.id;
        const room = RoomHandler.instance.getRoomByID(roomID);

        eventHandler.event = event;

        //Making sure that the new event has 5 cycles to be executed after the last event or current cycle.
        event.executeCycleNumber = Math.max(room.current_cycle, room.last_execution_cycle) + EXECUTE_CYCLE_OFFSET
        eventHandler.eventHistory.push(event);
        room.last_execution_cycle = event.executeCycleNumber;

        console.log("EVENT EMITTED")
        console.log(event)
        console.log("EVENT EMITTED \n\n")

        io.to(roomID).emit("event", event);
        res.sendStatus(200)
    });


    //Starts the express server
    httpServer.listen(app.get("port"), () => {
        console.log(`Server listening for events on port: ${app.get("port")}`)
    })
}
