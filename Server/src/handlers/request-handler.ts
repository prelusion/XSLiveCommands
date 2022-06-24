import {eventHandler, EXECUTE_CYCLE_OFFSET} from "../index";
import {ClientEvent, ServerEvent} from "../interfaces";
import {RoomHandler} from "./room-handler";

function toClientEvent(event: ServerEvent): ClientEvent {
    return {
        commandId: event.commandId,
        params: event.params,
        executeCycleNumber: 0,
    };
}

export function startExpressServer(httpServer, app, io) {

    /**
     * Listens for /event requests.
     * The expected format
     */
    app.post("/event", async (req, res) => {
        const event: ServerEvent = req.body;
        const roomID: string = req.query.id;
        const room = RoomHandler.instance.getRoomByID(roomID);

        if (room === undefined)
            return res.sendStatus(404);
        if (room.password !== null && event.password !== room.password)
            return res.sendStatus(401);

        const clientEvent: ClientEvent = toClientEvent(event);

        console.log(`Event registered for room: ${room.id}`);

        eventHandler.event = clientEvent;

        //Making sure that the new event has 5 cycles to be executed after the last event or current cycle.
        clientEvent.executeCycleNumber = Math.max(room.current_cycle, room.last_execution_cycle) + EXECUTE_CYCLE_OFFSET;
        eventHandler.eventHistory.push(clientEvent);
        room.last_execution_cycle = clientEvent.executeCycleNumber;

        console.log("EVENT EMITTED");
        console.log(event);
        console.log("EVENT EMITTED \n\n");

        io.to(roomID).emit("event", event);
        res.sendStatus(200);
    });

    //Starts the express server
    httpServer.listen(app.get("port"), () => {
        console.log(`Server listening for events on port: ${app.get("port")}`);
    });
}
