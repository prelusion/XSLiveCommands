int currentCycle = 0;

// Info about the registered command
int registeredExecutionCycle = -1;
int registeredCommandId = -1;
int registeredParamsArray = -1;

void writeStartToFile() {
    xsCreateFile(false);
    xsWriteString("start");
    xsCloseFile();
}

void writeCurrentCycleToFile() {
    xsCreateFile(false);
    xsWriteInt(currentCycle);
    xsCloseFile();
}

void executeCommand(
        int commandId = -1, 
        int param0 = -1, int param1 = -1, int param2 = -1, int param3 = -1, int param4 = -1, 
        int param5 = -1, int param6 = -1, int param7 = -1, int param8 = -1, int param9 = -1
) {
    xsChatData("Executing command on cycle: " + currentCycle);
    switch (commandId) {
        // Params: None
        case 0: { 
            xsChatData("Hello World");
        }
        // Params: 0: wood, 1: food, 2: gold, 3: stone
        case 1: {
            xsChatData("Give " + param0 + " wood, " + param1 + " food, " + param2 + " gold, " + param3 + " stone");
        }
        default: {
            xsChatData("Unknown command [" + commandId + "] (" + param0 + ", " + param1 + ", " + param2 + ", " + param3 + ", " + param4 + ", " + param5 + ", " + param6 + ", " + param7 + ", " + param8 + ", " + param9 + ")");
        }
    }
}

void executeCommandWrapper() {
    executeCommand(
        registeredCommandId, 
        xsArrayGetInt(registeredParamsArray, 0), 
        xsArrayGetInt(registeredParamsArray, 1), 
        xsArrayGetInt(registeredParamsArray, 2), 
        xsArrayGetInt(registeredParamsArray, 3), 
        xsArrayGetInt(registeredParamsArray, 4), 
        xsArrayGetInt(registeredParamsArray, 5), 
        xsArrayGetInt(registeredParamsArray, 6), 
        xsArrayGetInt(registeredParamsArray, 7), 
        xsArrayGetInt(registeredParamsArray, 8), 
        xsArrayGetInt(registeredParamsArray, 9)
    );
}

void emptyRegisteredParamsArray() {
    for (i = 0; < xsArrayGetSize(registeredParamsArray)) {
        xsArraySetInt(registeredParamsArray, i, -1);
    }
}

void printArray(int arr = -1) {
    if (arr == -1) {
        xsChatData("[]");
        return;
    }
    
    int size = xsArrayGetSize(arr);
    string result = "[";
    for (i = 0; < size) {
        result = result + xsArrayGetInt(arr, i);

        if (i < size - 1) {
            result = result + ", ";
        }
    }
    result = result + "]";
    xsChatData(result);
}

// Run every 5 seconds to write current cycle to file
rule cycleUpdate
    active
    runImmediately
    minInterval 5
    maxInterval 5
{
    xsChatData("Cycle: " + currentCycle);
    writeCurrentCycleToFile();

    if (currentCycle == registeredExecutionCycle) {
        executeCommandWrapper();
        xsEnableRule("readCommands");
    }

    currentCycle = currentCycle + 1;
}

// Run every second to read new commands
// File layout (all int32):
// 1:       Execution Cycle Number
// 2:       CommandId
// 3-12:    10 Parameters
rule readCommands
    active
    runImmediately
    minInterval 2
    maxInterval 2
{
    bool success = xsOpenFile("command");
    if (success == false) {
        xsCloseFile();
        return;
    }
    
    int executionCycle = xsReadInt();

    // If the registeredCycle (last executed one) is equal to the incoming one, 
    //      it means we're reading the old command, so ignore it.
    // If the cycle is different but the current cycle number has surpassed the incoming cycle, ignore it too.
    if (executionCycle == registeredExecutionCycle || currentCycle > executionCycle) {
        xsCloseFile();
        return;
    }

    registeredExecutionCycle = executionCycle;
    registeredCommandId = xsReadInt();
    emptyRegisteredParamsArray();

    xsChatData("Registered command. Cycle: " + executionCycle + ", id: " + registeredCommandId);

    // Read params
    for(i = 0; < 10) {
        int value = xsReadInt();

        if (value == -1) {
            xsDisableSelf();
            break;
        }
        xsArraySetInt(registeredParamsArray, i, value);
    }
    xsCloseFile();
}

void main() {
    writeStartToFile();
    registeredParamsArray = xsArrayCreateInt(10, -1, "registeredParamsArray");
}
