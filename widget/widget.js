let isIframeOpen = false;

function createChatWidget(elm) {
  const parent = document.getElementById("chat-widget");
  const iframe = document.createElement("iframe", {});
  iframe.setAttribute("id", "chat-iframe");
  iframe.setAttribute("src", "http://localhost:5173");
  parent.appendChild(iframe);
}

function toggleIframe() {
  const iframe = document.getElementById("chat-iframe");
  if (isIframeOpen) {
    iframe.style.display = "none";
  } else {
    if (!iframe) {
      createChatWidget(document.getElementById("chat-widget"));
    } else {
      iframe.style.display = "block";
    }
  }
  isIframeOpen = !isIframeOpen;
}
