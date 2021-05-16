var ispdf;
function winclose() {
  window.close();
}
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var url = tabs[0].url;
  if (!url.match(/chrome:\/\//)) {
    chrome.tabs.sendMessage(tabs[0].id, { message: "ispdf" }, function (res) {
      if (res == true) {
        ispdf = true;
      } else {
        ispdf = false;
      }
      document.querySelector(".icon").innerHTML =
        "<img src=" + '"' + chrome.runtime.getURL("icon24.png") + '">';
      if (ispdf) {
        document.querySelector("#pagetrans").remove();
      } else {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { message: "selectionmode" },
              function (res) {
                //setTimeout(winclose, 15000);
                if (chrome.runtime.lastError) {
                }
              }
            );
          }
        );
      }
    });
  } else {
    winclose();
  }
});

document.querySelector("#pagetrans").onclick = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let conf = confirm("Are you sure you want to translate this page?");
    if (conf == true) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "cancelSelectionMode" },
        function (res) {
          if (chrome.runtime.lastError) {
          }
          chrome.tabs.sendMessage(
            tabs[0].id,
            { message: "page_translate" },
            function () {
              if (chrome.runtime.lastError) {
              }
            }
          );
          window.close();
        }
      );
    }
  });
};
function restore_options() {
  chrome.storage.sync.get(
    {
      target: "EN-US",
    },
    function (items) {
      document.querySelector("#target").value = items.target;
    }
  );
}

function change() {
  chrome.storage.sync.set(
    {
      target: document.querySelector("#target").value,
    },
    function () {
      const save = document.querySelector("#message");
      save.textContent = "Saved!";
      setTimeout(function () {
        window.close();
      }, 500);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "cancelSelectionMode" },
          function (res) {
            if (chrome.runtime.lastError) {
            }
          }
        );
      });
    }
  );
}

document.querySelector("#target").addEventListener("change", change);
document.addEventListener("DOMContentLoaded", restore_options);
