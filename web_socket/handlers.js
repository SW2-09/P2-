export { startWebsocketserver, handlers };

import { JobQueue } from "../Jobtypes/jobQueue.js";
import { subtaskFeeder } from "../Jobtypes/taskFeed.js";
import { WebSocketServer } from "ws";
import { server } from "../server.js";

/**
 * Object: websocket handlers
 * @param ws - websocket connection with the worker (
 * @param JobQueue - Queue of all jobs submitted by buyers
 */

let handlers={
  subtaskFeeder: subtaskFeeder,
  sendSubtask: function send_subtask(ws, workerId) {
    let next_task = handlers.subtaskFeeder(JobQueue);
    if (next_task !== null) { //if there is a subtask to send
      ws.send(JSON.stringify(next_task));
    }
    else{ //if there is no subtask to send
      console.log("sending 0 to: " + workerId)
      ws.send("0");
    }
  },
  messageHandler: function (ws) { //callback for when a message is recieved from the client
    // Try is for if some one sends somehting which cannot be passed to JSON:
    return (message) => {
    try {
      let messageParse = JSON.parse(message);
      
      if (messageParse["data"] === "ready for work") { //if the worker is ready for work
      //send_subtask(ws, JobQueue); //send a subtask to the worker
      handlers.sendSubtask(ws, messageParse["workerId"]);
      
      }
      else {
        let messageParse = JSON.parse(message);
        let currentJob=findJob(messageParse["jobId"]);
        console.log("Solution recieved:");
        
        console.log("jobID: " + messageParse["jobId"]);
        console.log("taskID: " + messageParse["taskId"]);
         //find the job in the queue
        let currentSolution = messageParse["solution"];
        let workerFound = false;
        for (let index = 0; index < currentJob.solutions.length; index++) {

          if (currentJob.solutions[index].workerId === messageParse["workerId"]) {
            workerFound = true;
            currentJob.solutions[index].workerSolutions.push({
                                                              taskId: messageParse["taskId"],
                                                              solution: createTaskSolution(currentSolution)
                                                            });
            currentJob.numOfSolutions++;
            break;
          }
        }
        if (workerFound === false) {
          
          currentJob.solutions.push({
                                      workerId: messageParse["workerId"], 
                                      workerSolutions: [{
                                                        taskId: messageParse["taskId"],
                                                        solution: createTaskSolution(currentSolution)
                                                      },]
                                    });
          currentJob.numOfSolutions++;
        }
        currentJob.pendingList.removeTask(messageParse["taskId"]); //remove the task from the pending list
        // console.log("job solutions" + JobQueue.tail.solutions.length);
        // console.log(messageParse["solution"]);
        handlers.sendSubtask(ws, messageParse["workerId"]);
      }
        } finally{}
        // catch (e) {
        //     //if the message cannot be parsed to JSON
        //     console.log(
        //         `Something went wrong with the recieved message: ${e.message}`
        //     );
        // }

    }}
    ,
    connectionHandler: function (ws) {
        //callback for when a new client connects
        handlers.ws = ws;
        console.log("New client connected");

        ws.send("0")

        ws.on("message", handlers.messageHandler(ws));

        ws.on("close", () => {
            //when the worker disconnects
            console.log("Client has disconnected");
        });
    },
};

function startWebsocketserver(host, port) {
    const wss = new WebSocketServer({ host: host, port: port });
    console.log(`There are ${JobQueue.size} jobs in the queue.`);

    wss.on("connection", handlers.connectionHandler);
}

/**
 * Function to find a job in the queue by its jobId
 * @param {number} jobId
 * @returns the job with the given jobId
 **/

function findJob(jobId){
  console.log("!!!!i am finding job!!!!")
  let currentJob=JobQueue.tail;
  if (currentJob.jobId==jobId){
    return currentJob;
  }
  while(currentJob.previous.jobId!=jobId){
    currentJob=currentJob.previous;
  }
  return currentJob.previous;
}


/**
 * function to create a solution array the solution received from the worker
 * @param {array} input 
 * @returns the solution array
 */
function createTaskSolution(input){
  let solutionArray=[];
  input.forEach(element => {
    solutionArray.push(element);
  });
  return solutionArray;
}

