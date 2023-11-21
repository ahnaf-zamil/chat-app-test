let isIframeOpen = false;

function createChatWidget(elm) {
  const parent = document.getElementById("chat-widget");
  const iframe = document.createElement("iframe", {});
  iframe.setAttribute("id", "chat-iframe");
  iframe.setAttribute(
    "src",
    "https://655c9af22558ac73aca4e328--thunderous-pasca-e2a069.netlify.app"
  );
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
