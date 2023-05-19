const mainDiv = document.getElementById("mainDiv");

// HTML content for the main div, used for navigation between pages when logged in a buyer
const content = {
    CreateJob: `<div class=createJobSubheader>
<h1>Job creation</h1>
</div>

<div id="creationForm" class="uploadForm">
<form  
    enctype="multipart/form-data" id="uploadForm" >
    
    <div>
        <input class="form-control" type="text" name="jobTitle" id="jobTitle" placeholder="Job Title" maxlength="30" required>
    </div>

    <div>
        <input class="form-control" type="text" name="jobDescription" id="jobDescription" placeholder="Job Description" maxlength="200" required>
    </div>

    <div id="typeChoice" class="form-control">
        <select  id="jobType" name="jobType" class="form-dropdown">
            <option value="none">Job Type</option>
            <option id="ny" value="matrixMult">Matrix multiplication</option>
            <option value="plus">Plus</option>
            </select>
    </div>

    <div id="Uploadtype"></div>
</form>
<div class="buttons">
<input class="createjob-button" id="submit" type="submit" value="Create Job">
<button id="goBack-btn" class="cancelJob">Cancel</button>
</div>
</div>
<div class=alert></div>
<div class=alertuploading></div>
`,

    JobsOverview: `
<div id="overviewDiv">
  <div>
    <h1>Your jobs</h1>
    <div class="JobTable">
    </div>
    <div>
    <button id="jobInfo-button" class="JobsOverviewButtons">Update joblist</button>
    <button id="goBack-btn" class="JobsOverviewButtons">Go back</button>
    </div>
  </div>
</div>`,

    FrontPage: `
<div id="frontPage">
  <div>
    <h1> Job manager </h1>
    <p>Submit a new grid computing job by pressing "Create new job". To get results of a job, press "Jobs overview".</p>
    <button id="createJob-button" class="frontPageButtons"> Create new job</button>
    <button id="jobInfo-button" class="frontPageButtons"> Jobs overview</button>
  </div>`,

    underconstruction: `<div>
<h1>Under construction</h1>
</div>
<div>
<button id="cancelJob">Cancel </button>
</div>
`,

    matrixUpload: `<div>
  <div class="form-control">
    <label for="uploadFile">Matrix A</label>
    <input type="file" id="uploadFile" name="uploadFile" accept=".csv" required>
  </div>
  <div class="form-control">
    <label for="uploadFile2">Matrix B</label>
    <input type="file" id="uploadFile2" name="uploadFile2" accept=".csv" required>
  </div>  
</div>`,

    plusUpload: `<div>
<div class="form-control">
    <label for="uploadFile">Numbers to add</label>
    <input type="file" id="uploadFile" name="uploadFile" accept=".csv" required>
  </div>
</div>`,
};

mainDiv.innerHTML = content.FrontPage;

// Click event listener for the main div
mainDiv.addEventListener("click", (e) => {
    if (e.target.id === "createJob-button") {
        mainDiv.innerHTML = content.CreateJob;
    }
    // Jobs overview button
    if (e.target.id === "jobInfo-button") {
        generateTable();
    }
    // Cancel job button
    if (e.target.classList.contains("alertclosebtn")) {
        document.querySelector(".alert").style.display = "none";
    }
    // go back button
    if (e.target.id === "goBack-btn") {
        mainDiv.innerHTML = content.FrontPage;
    }

    //create job button
    if (e.target.id === "submit") {
        createJob(e);
    }

    //download solution button
    if (e.target.classList.contains("download_btn")) {
        downloadJob(e);
    }

    //delete job button
    if (e.target.classList.contains("delete_btn")) {
        deleteJob(e);
    }
});

// Change event listener for the main div
mainDiv.addEventListener("change", (e) => {
    if (e.target.id === "jobType") {
        if (e.target.value === "matrixMult") {
            document.getElementById("Uploadtype").innerHTML =
                content.matrixUpload;
        } else if (e.target.value === "plus") {
            document.getElementById("Uploadtype").innerHTML =
                content.plusUpload;
        } else {
            document.getElementById("Uploadtype").innerHTML = "";
        }
    }
});

// ***************** //
// Helper functions: //
// ***************** //

/**
 * Takes a .csv file and parses the content of the file to JSON based on the job type.
 *
 * @param {File.csv} file - .csv file to be parsed.
 * @param {string} jobType - The type of job to parse (either `matrixMult` or `plus`).
 */
function parseCsvToJson(file, jobType) {
    return new Promise((resolve, reject) => {
        let data = [];

        Papa.parse(file, {
            download: true,
            header: false,
            skipEmptyLines: true,
            complete: function (results) {
                let placeholder = [];
                if (jobType === "matrixMult") {
                    for (let i = 0; i < results.data.length; i++) {
                        for (let j = 0; j < results.data[i].length; j++) {
                            if (results.data[i][j]) {
                                placeholder.push(
                                    parseFloat(results.data[i][j])
                                );
                            }
                        }

                        data.push(placeholder);
                        placeholder = [];
                    }

                    resolve(data);
                } else if (jobType === "plus") {
                    for (let i = 0; i < results.data[0].length; i++) {
                        data.push(parseFloat(results.data[0][i]));
                    }
                }

                resolve(data);
            },

            error: function (err) {
                reject(err);
            },
        });
    });
}

/**
 * Javascript funcitonality for the create Job tab.
 * Creates a onepage that can handle either `matrixMult` or `plus` jobs.
 *
 * @param {Event} e - The event object from the form.
 */
async function createJob(e) {
    const jobType = document.getElementById("jobType").value;
    const Uploadform = document.getElementById("uploadForm");
    const jobTitle = document.getElementById("jobTitle").value;
    const jobTitleInput = document.getElementById("jobTitle");
    const jobDescription = document.getElementById("jobDescription").value;
    jobTitleInput.setCustomValidity("");

    if (!Uploadform.checkValidity() || jobType === "none") {
        Uploadform.reportValidity();
        return;
    }

    let allowedchars = /^[a-zA-Z0-9-_]*$/;
    if (!allowedchars.test(jobTitle)) {
        jobTitleInput.setCustomValidity("Only letters, numbers, - and _ allowed");
        await Uploadform.reportValidity();
        return;
    }

    try {
        buttonDisableStatusUpload(true);
        let formData;
        switch (jobType) {
            case "matrixMult": {
                uploadingPleaseWait();
                e.preventDefault();
                const fileInput1 = document.getElementById("uploadFile");
                const fileInput2 = document.getElementById("uploadFile2");

                const file1 = await validateAndParse(
                    fileInput1.files[0],
                    jobType
                );
                const file2 = await validateAndParse(
                    fileInput2.files[0],
                    jobType
                );

                if (!validateMatrix(file1, file2)) {
                    throw new Error("Error in validation");
                }

                formData = {
                    jobTitle: jobTitle,
                    jobId: Date.now() + "_" + jobTitle,
                    jobDescription: jobDescription,
                    jobType: jobType,
                    uploadFile: file1,
                    uploadFile2: file2,
                };
                console.log(formData.jobId);

                break;
            }
            case "plus": {
                e.preventDefault();
                const fileInput = document.getElementById("uploadFile");

                const file = await validateAndParse(
                    fileInput.files[0],
                    jobType
                );

                if (!validateList(file)) {
                    throw new Error("Error in validation");
                }

                formData = {
                    jobTitle: jobTitle,
                    jobId: Date.now() + "_" + jobTitle,
                    jobDescription: jobDescription,
                    jobType: jobType,
                    uploadFile: file,
                };

                break;
            }
            default:
                console.log("error jobtype not supported");
                break;
        }
        const response = await fetch("/buyer/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const result = await response.text();
        console.log(result);
        buttonDisableStatusUpload(false);
        doneUploading();
    } catch (err) {
        console.log(err);
        clearNotification();
        buttonDisableStatusUpload(false);
    }
}

/**
 * Fetches a job for the current buyer from the server.
 *
 * @returns {object} object containing an array with information about the buyer's jobs and the buyers username
 * */
async function getJobarrayFromDB() {
    const response = await fetch("/buyer/jobinfo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await response.json();
}

/**
 *
 * Generates a table of jobs for the buyer
 */
async function generateTable() {
    mainDiv.innerHTML = content.JobsOverview;
    let infoObject = await getJobarrayFromDB();

    let jobTable = document.createElement("table");

    document.querySelector(".JobTable").append(jobTable);

    let tableHeader =
        "<th>Index</th> <th>Title</th> <th>Description</th> <th> Type</th> <th> Download solution </th> <th> Delete job </th>";

    jobTable.insertRow(0).innerHTML = tableHeader;

    infoObject.jobs.forEach((job, index) => {
        let row = jobTable.insertRow(index + 1);
        row.insertCell(0).innerHTML = index + 1;
        row.insertCell(1).innerHTML = job.jobTitle;
        row.insertCell(2).innerHTML = job.Des;
        row.insertCell(3).innerHTML = job.type;
        if (job.completed) {
            row.insertCell(
                4
            ).innerHTML = `<button class="download_btn" id="${job.jobId}"> 
             Prepare download</button>`;
        } else {
            row.insertCell(4).innerHTML = "<p>Not completed</p>";
        }
        row.insertCell(
            5
        ).innerHTML = `<button class="delete_btn" id="${job.jobId}"> Delete job </button>`;
    });
}

/**
 * Validates the requirements of the two matrices for multiplication.
 * Checks for none-numbers and correct matrix dimensions. This function is designed to help the buyer, not to provide security.
 *
 * @param {array} matrixA - First matrix to validate
 * @param {array} matrixB - Second matrix to validate
 * @returns {boolean} `true` if success, `false` otherwise.
 */
function validateMatrix(matrixA, matrixB) {
    try {
        //Check dimensions of matricies
        if (matrixA[0].length !== matrixB.length) {
            throw new Error("Matrix dimensions do not match.");
        }
        let troubleChars = [
            "\t",
            "\n",
            "\x0B",
            "\f",
            " ",
            " ",
            String.fromCharCode(160),
            String.fromCharCode(13),
        ];

        // Check MatrixA
        for (let rowA = 0; rowA < matrixA.length; rowA++) {
            for (let colA = 0; colA < matrixA[rowA].length; colA++) {
                if (isNaN(matrixA[rowA][colA])) {
                    throw new Error("Matrix A is corrupted.");
                }
                for (let i = 0; i < troubleChars.length; i++) {
                    if (matrixA[rowA][colA] === troubleChars[i]) {
                        throw new Error("Matrix A is corrupted.");
                    }
                }
            }
        }

        // Check MatrixB
        for (let rowB = 0; rowB < matrixB.length; rowB++) {
            for (let colB = 0; colB < matrixB[rowB].length; colB++) {
                if (isNaN(matrixB[rowB][colB])) {
                    throw new Error("Matrix B is corrupted.");
                }
                for (let i = 0; i < troubleChars.length; i++) {
                    if (matrixB[rowB][colB] === troubleChars[i]) {
                        throw new Error("Matrix B is corrupted.");
                    }
                }
            }
        }
    } catch (err) {
        alert(err + " Please choose valid matricies.");
        return false;
    }
    return true;
}

/**
 * Validates a list for length and content.
 *
 * @param {Array} list - The list to validate.
 * @returns `true` if valid, false otherwise.
 */
function validateList(list) {
    console.log(list);
    try {
        if (list.length > 100) {
            throw new Error("List is too long, this is a slow algorithm.");
        }
        for (let i = 0; i < list.length; i++) {
            if (isNaN(list[i])) {
                throw new Error("File is corrupt.");
            }
        }
    } catch (err) {
        alert(err + " Please try again");
        return false;
    }
    return true;
}

function uploadingPleaseWait() {
    let alert = document.createElement("div");
   
    document.querySelector(".alertuploading").style.display = "flex";
    setTimeout(() => {
        document.querySelector(".alertuploading").style.opacity = "1";
    }, 100);
    document.querySelector(".alertuploading").append(alert);

    alert.innerHTML = `Uploading job, please wait...`;
}

/**
 * Displays a notification to the buyer saying that the job was succesfully uploaded.
 */
function doneUploading() {
    mainDiv.innerHTML = content.CreateJob;
    let alert = document.createElement("div");
    let alertClose = document.createElement("button");

    alertClose.classList.add("alertclosebtn");
    document.querySelector(".alert").style.display = "flex";
    setTimeout(() => {
        document.querySelector(".alert").style.opacity = "1";
    }, 100);
    document.querySelector(".alert").append(alert);
    document.querySelector(".alert").append(alertClose);

    alert.innerHTML = `Job has been uploaded`;
    alertClose.innerHTML = `x`;

    setTimeout(() => {
        document.querySelector(".alert").style.opacity = "0";
        setTimeout(() => {
            document.querySelector(".alert").style.display = "none";
        }, 1000);
    }, 4000);
}

/**
 * Validates and parses a file based on the job type.
 * The file must be either CSV or JSON and it's max size is 50 MB.
 *
 * @param {File} file - The file to validate and parse
 * @param {string} jobType - Type of job to validtae for.
 * @returns {promise} a promise that resolves to an array of parsed data.
 */
async function validateAndParse(file, jobType) {
    const allowedFileFormat = ["csv", "json"]; //allows JSON and csv formats
    const maxFileSize = 50 * 1024 * 1024; // 50 MB
    const fileEnding = file.name.split(".").pop().toLowerCase();

    if (!allowedFileFormat.includes(fileEnding)) {
        alert("Please choose a valid file format(csv or json)");
        return;
    }

    if (file.size > maxFileSize) {
        alert("Please choose a file smaller than 50 MB");
        return;
    }

    let result = await parseCsvToJson(file, jobType);
    return result;
}

/**
 * Initiates the job download process.
 *
 * @param {Event} e - The event object from the download button click.
 */
async function downloadJob(e) {
    const response = await fetch("/buyer/download", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: e.target.id }),
    });
    let blob = await response.blob();
    //creates tempoary URL
    let fileURL = window.URL.createObjectURL(blob);

    document.getElementById(
        e.target.id
    ).innerHTML = `<a href=${fileURL} download=${e.target.id}> Download</a>`;
}

/**
 * Deletes a job by sending a fetch request to the server and updates the job table.
 * @param {Event} e - the event object from the delete button click.
 */
async function deleteJob(e) {
    try {
        const response = await fetch("/buyer/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: e.target.id }),
        });

        if (!response.ok) {
            throw new Error(`HTTP post error! ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        generateTable();
    } catch (err) {
        console.error("Error: " + err);
    }
}


function buttonDisableStatusUpload(status){
    let uploadButton = document.getElementById("submit");
    let cancelButton = document.getElementById("goBack-btn");

    if(status){
    uploadButton.disabled = true;
    cancelButton.disabled = true;
    uploadButton.style.backgroundColor = "grey";
    cancelButton.style.backgroundColor = "grey";

    }else{
    uploadButton.disabled = false;
    cancelButton.disabled = false;
    uploadButton.style.backgroundColor = "#333";
    cancelButton.style.backgroundColor = "#333";
    }
}

function clearNotification(){
    let alert = document.querySelector(".alertuploading");
    alert.style.opacity = "0";
    setTimeout(() => {
        alert.innerHTML = "";
        alert.style.display = "none";
    }, 1000);
}