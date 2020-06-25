const { BlobServiceClient } = require("@azure/storage-blob");
const $ = require("./vendors/jquery/jquery-3.5.1");

$(document).ready(function () {
  $("#feedback").hide();
});

const createContainerButton = document.getElementById(
  "create-container-button"
);
const deleteContainerButton = document.getElementById(
  "delete-container-button"
);
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const listButton = document.getElementById("list-button");
const clearData = document.getElementById("clearData");
const fileList = document.getElementById("file-list");
const status = document.getElementById("status");
const feedback = document.getElementById("feedback");

const reportStatus = (message) => {
  status.innerHTML += `${message}<br/>`;
  status.scrollTop = status.scrollHeight;
};

const blobSasUrl =
  "https://wpfileupload.blob.core.windows.net/?sv=2019-10-10&ss=b&srt=sco&sp=rwdlacx&se=2020-06-25T21:11:47Z&st=2020-06-25T13:11:47Z&spr=https&sig=cVOiaYHI%2FcVPLvtW%2F6d18bhuisKwdmdU2YXST3%2FSrOo%3D";

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Create a unique name for the container by
// appending the current time to the file name
// const containerName = "container" + new Date().getTime();
const containerName = "wpfiles";

// Get a container client from the BlobServiceClient
const containerClient = blobServiceClient.getContainerClient(containerName);

clearData.addEventListener("click", clearDiv);

function clearDiv() {
  status.innerHTML = "";
  fileList.innerHTML = "";
  $("#feedback").hide();
}

const listFiles = async () => {
  $("#feedback").show();
  fileList.size = 0;
  fileList.innerHTML = "";
  try {
    reportStatus("Retrieving file list...");
    let iter = containerClient.listBlobsFlat();
    let blobItem = await iter.next();
    while (!blobItem.done) {
      fileList.size += 1;
      fileList.innerHTML += `<option>${blobItem.value.name}</option>`;
      blobItem = await iter.next();
    }
    if (fileList.size > 0) {
      reportStatus("Done.");
    } else {
      reportStatus("The container does not contain any files.");
    }
  } catch (error) {
    reportStatus(error.message);
  }
};

listButton.addEventListener("click", listFiles);

const uploadFiles = async () => {
  try {
    reportStatus("Uploading files...");
    const promises = [];
    for (const file of fileInput.files) {
      const blockBlobClient = containerClient.getBlockBlobClient(file.name);
      promises.push(blockBlobClient.uploadBrowserData(file));
    }
    await Promise.all(promises);
    reportStatus("Done.");
    listFiles();
  } catch (error) {
    reportStatus(error.message);
  }
};

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);

const deleteFiles = async () => {
  try {
    if (fileList.selectedOptions.length > 0) {
      reportStatus("Deleting files...");
      for (const option of fileList.selectedOptions) {
        await containerClient.deleteBlob(option.text);
      }
      reportStatus("Done.");
      listFiles();
    } else {
      reportStatus("No files selected.");
    }
  } catch (error) {
    reportStatus(error.message);
  }
};

// deleteButton.addEventListener("click", deleteFiles);
