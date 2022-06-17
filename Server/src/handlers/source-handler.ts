import {ClientEvent} from "../interfaces";
import {
    CURRENT_CYCLE,
    eventHandler,
    EXECUTE_CYCLE_OFFSET,
    LAST_EXECUTION_CYCLE,
    setLastExecutionCycle
} from "../index";

export function startExpressServer(httpServer, app, io) {
    app.post('/event', async (req, res) => {
        const event: ClientEvent = req.body;

        eventHandler.event = event;

        //Making sure that the new event has 5 cycles to be executed after the last event or current cycle.
        event.executeCycleNumber = Math.max(CURRENT_CYCLE, LAST_EXECUTION_CYCLE) + EXECUTE_CYCLE_OFFSET
        eventHandler.eventHistory.push(event);
        setLastExecutionCycle(event.executeCycleNumber);

        console.log("EVENT EMITTED")
        console.log(event)
        console.log("EVENT EMITTED")
        io.emit("event", event)
        res.sendStatus(200)
    });

    //Starts the express server
    httpServer.listen(app.get("port"), () => {
        console.log(`Server listening for events on port: ${app.get("port")}`)
    })
}
