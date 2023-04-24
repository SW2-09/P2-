const mainDiv = document.getElementById("mainDiv");

const content = {
CreateJob: `<div>
<h1>Job creation</h1>
</div>

<div id="creationForm" class="uploadForm">
<form  
    enctype="multipart/form-data" id="uploadForm" >
    
    <div>
        <input class="form-control" type="text" name="jobTitle" id="jobTitle" placeholder="Job Title" required>
    </div>

    <div>
        <input class="form-control" type="text" name="jobDescription" id="jobDescription" placeholder="Job Description" required>
    </div>

    <div id="typeChoice" class="form-control">
        <select  id="jobType" name="jobType" class="form-dropdown">
            <option value="none">Job Type</option>
            <option id="ny" value="matrixMult">Matrix multiplication</option>
            <option value="none">Et sejt projekt</option>
            <option value="none">Et andet sejt projekt</option>
            </select>
    </div>

    <div id="Uploadtype"></div>
</form>
<div class="buttons">
<input class="createjob-button" id="submit" type="submit" value="Create Job">
<button id="cancelJob" class="cancelJob">Cancel</button>
</div>
</div>
`,

JobList:`

`

/*

<script> 

</script>

</div>
*/
,
JobsOverview: `
<div id="overviewDiv">
  <div>
    <h1>Current jobs</h1>
    <div class="JobTable">
    Det skal ind her
    </div>
    <div>
    <button id="joblistUpdate">Update joblist</button>
    </div>
  </div>
</div>`,

FrontPage:`
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
};




const generateTable = (DOMProperty) => {
  //Test job object

  const job1={
    Titel : "job-1",
    Des  : "important job",
    type : "matrix multiplication nxn",
  }
  const job2={
    Titel : "job-2",
    Des  : "Less important job",
    type : "matrix multiplication nxm",
  }
  const job3={
    Titel : "job-3",
    Des  : "Less important job",
    type : "matrix multiplication nxm",
  }
  let jobArray = [job1,job2, job3];

  let jobTable=document.createElement('table');

  document.querySelector(".JobTable").append(jobTable);

  let tableHeader="<th>Titel</th> <th>ID</th> <th>Description</th> <th> Status </th>";

  jobTable.insertRow(0).innerHTML=tableHeader;

  jobArray.forEach((job, index) => {
    let row = jobTable.insertRow(index+1);
    row.insertCell(0).innerHTML=job.Titel;
    row.insertCell(1).innerHTML=job.Des;
    row.insertCell(2).innerHTML=job.type;
    row.insertCell(3).innerHTML="under construction";
  });


}

// Create job button
mainDiv.addEventListener("click", (e) => {
    if (e.target.id === "createJob-button") {
        mainDiv.innerHTML = content.CreateJob;
    }
});
// Jobs overview button
mainDiv.addEventListener("click", (e) => {
  if (e.target.id === "jobInfo-button") {
      mainDiv.innerHTML = content.JobsOverview;   
      const jobHTML = document.querySelector(".JobTable");
      jobHTML.innerHTML = content.JobList;
      generateTable(jobHTML.body)
      
  }
});
// Cancel job button
mainDiv.addEventListener("click", (e) => {
    if (e.target.id === "cancelJob") {
      mainDiv.innerHTML = content.CurrentJobs;
        
    }
});

mainDiv.addEventListener("change", (e) => {
    if (e.target.id === "jobType") {
        if (e.target.value === "matrixMult") {
            document.getElementById('Uploadtype').innerHTML = content.matrixUpload;
        }
        else {
            document.getElementById('Uploadtype').innerHTML = ''
        }
    }
});

mainDiv.innerHTML = content.FrontPage;



mainDiv.addEventListener("click", async (e) => {
    if (e.target.id === "submit") {
      const jobType = document.getElementById("jobType").value;
      const Uploadform = document.getElementById("uploadForm")

        if(!Uploadform.checkValidity() ||jobType==="none") {
            Uploadform.reportValidity();
            e.preventDefault();}
            
            else {

        e.preventDefault();
        const jobTitle = document.getElementById("jobTitle").value;
        const jobDescription = document.getElementById("jobDescription").value;
        const jobType = document.getElementById("jobType").value;
        const fileInput1 = document.getElementById("uploadFile");
        const fileInput2 = document.getElementById("uploadFile2");

        const allowedFileFormat = ["text/csv", "application/json"]; //allows JSON and csv formats
        const maxFileSize = 10 * 1024 * 1024; // 10 MB

        if (!allowedFileFormat.includes(fileInput1.files[0].type) || !allowedFileFormat.includes(fileInput2.files[0].type)) {
            alert("Please choose a valid file format(csv or json)");
            return;
        }

        const file1 = await parseCsvToJson(fileInput1.files[0]);
        const file2 = await parseCsvToJson(fileInput2.files[0]);
    
        const formData = {jobTitle : jobTitle, jobDescription : jobDescription, jobType : jobType, uploadFile : file1, uploadFile2 : file2}
        
        const response = await fetch("/buyer/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
              },
            body: JSON.stringify(formData),
        });
        
        const result = await response.text();
        console.log("server response:" + result);
        
    }
}});


function parseCsvToJson(file) {
    return new Promise((resolve, reject) => {
      let matrix = [];
  
      Papa.parse(file, {
        download: true,
        header: false,
        skipEmptyLines: true,
        complete: function (results) {
          let placeholder = [];
  
          for (let i = 0; i < results.data.length; i++) {
            for (let j = 0; j < results.data[i].length; j++) {
              if (results.data[i][j]) {
                placeholder.push(parseFloat(results.data[i][j]));
              }
            }
  
            matrix.push(placeholder);
            placeholder = [];
          }
  
          resolve(matrix);
        },
        error: function (err) {
          reject(err);
        },
      });
    });
  }

mainDiv.addEventListener("click", async (e) => {
  if (e.target.id === "joblistUpdate") {
  console.log("jobinfo wip")

  getJobarrayFromDB("QWERT")

  }
})



async function getJobarrayFromDB(username){
  console.log(username)
  const repsonse = await fetch("/buyer/jobinfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //Send username to server

    body: JSON.stringify({username: username}),

  })
  
}

/*  document.getElementById("joblistUpdate").addEventListener("click",async (e) => {
        console.log("jobinfo wip")
        const repsonse=await fetch("/buyer/joblist")
  })
  */


document.getElementById("testbutton").addEventListener('click', () => {
    console.log("test")
    fetch("/buyer/test", {
        method: "POST",
})});