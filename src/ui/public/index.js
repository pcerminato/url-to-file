const form = document.querySelector("form");
const button = document.querySelector("button#download");
const status = document.querySelector("div#status");
const statusValue = status.querySelector("span#status-value");
const statusJobId = status.querySelector("span#status-job-id");
const downloadAnchor = status.querySelector("a#download");
const statusTitle = status.querySelector("h3");
const urlInput = form["input_url"];

function updateViewStatus({ status, jobId, fileUrl }) {
  if (status !== undefined) {
    statusValue.innerHTML = status;
  }
  if (status === "done" && fileUrl !== undefined) {
    downloadAnchor.setAttribute("href", fileUrl);
    downloadAnchor.innerHTML = fileUrl;
    statusTitle.innerHTML = "Ready";
  }
  if (status === "error" && fileUrl !== undefined) {
    statusTitle.innerHTML = "Failed";
  }
  if (jobId !== undefined) {
    statusJobId.innerHTML = jobId;
  }
}

// @alias main()
async function startDownloadFile(e) {
  e.preventDefault();

  let sourceUrl;
  let fileType;

  if (form) {
    form.setAttribute("inert", true);
    form.classList.add("hidden");
    status.classList.remove("hidden");

    sourceUrl = urlInput.value;
    fileType = form["file_type"].value;
  }

  if (sourceUrl && fileType) {
    const jobId = await downloadFile({ sourceUrl, fileType });
    updateViewStatus({ jobId });
    await startPolling(jobId);
  }
}

async function downloadFile({ sourceUrl, fileType }) {
  const url = new URL("http://localhost:8081/download-file");

  url.searchParams.append("source-url", encodeURI(sourceUrl));
  url.searchParams.append("file-type", encodeURI(fileType));

  const res = await fetch(url.toString());
  const resData = await res.json();
  const jobId = resData?.jobId || "";

  return jobId;
}

async function startPolling(jobId, timeout = 5000) {
  if (jobId) {
    try {
      const url = new URL(
        `http://localhost:8081/download-file/status/${jobId}`,
      );

      // polling at incremental intervals. After 3 times, fails.
      const res = await fetch(url);
      const data = await res.json();

      if (data) {
        const { status, fileName, fileUrl, jobId } = data;

        updateViewStatus({ status, fileUrl });

        if (status === "pending" || status === "progress") {
          if (timeout <= 20_000) {
            setTimeout(
              async () => await startPolling(jobId, timeout * 2),
              timeout,
            );
          } else {
            console.error(
              "Timeout. Failed to download the file (",
              fileName,
              ")",
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    console.error("Cannot download the file. Missing job id.");
  }
}

button.addEventListener("click", startDownloadFile);

urlInput.addEventListener("keyup", function urlInputValidity(e) {
  if (!form.checkValidity()) {
    urlInput.setAttribute("aria-invalid", "true");
    button.setAttribute("disabled", "true");
  } else {
    urlInput.removeAttribute("aria-invalid");
    button.removeAttribute("disabled");
  }
});
