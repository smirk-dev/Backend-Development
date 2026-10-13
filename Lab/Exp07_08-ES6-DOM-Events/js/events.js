// Part C — event handling, one live demo per manual section (5.2 – 5.9).

const $ = (sel, root = document) => root.querySelector(sel);

const writer = (id, max = 8) => {
    const el = $(`#${id}`);
    const lines = [];
    return (text, reset = false) => {
        if (reset) lines.length = 0;
        lines.push(text);
        if (lines.length > max) lines.shift();
        el.textContent = lines.join("\n");
    };
};

// 5.2 Three ways to attach a handler
{
    const log = writer("out-attach", 10);
    const btn = $("#attach-btn");
    window.attachAttrClicked = () => log("1. HTML attribute onclick fired");

    const propBtn = $("#attach-prop");
    propBtn.onclick = function () { log("2. DOM property fired (only one allowed)"); };
    propBtn.onclick = function () { log("2. DOM property fired — this replaced the first handler"); };

    btn.addEventListener("click", function () { log("3a. addEventListener handler #1"); });
    btn.addEventListener("click", () => log("3b. addEventListener handler #2 (both run)"));
    log("Click each button.");
}

// 5.3 + 5.4 Event types and the event object
{
    const log = writer("out-event", 9);
    const pad = $("#event-pad");
    const report = (e) => log(
        `${e.type.padEnd(10)} target=<${e.target.tagName.toLowerCase()}> x=${e.clientX} y=${e.clientY} t=${Math.round(e.timeStamp)}ms`);
    ["click", "dblclick", "mouseover", "mouseout", "mousedown", "mouseup"].forEach(type =>
        pad.addEventListener(type, report));
    log("Move, click and double-click the pad.");
}

// 5.5 Keyboard events
{
    const log = writer("out-key", 6);
    const field = $("#key-field");
    field.addEventListener("keydown", (event) => {
        log(`keydown  key="${event.key}" code=${event.code} ctrl=${event.ctrlKey} shift=${event.shiftKey}`);
    });
    field.addEventListener("keyup", (event) => {
        log(`keyup    key="${event.key}"`);
    });
}

// 5.6 Form events
{
    const log = writer("out-form", 8);
    const form = $("#myForm");
    const username = $("#username");
    form.addEventListener("submit", (event) => {
        event.preventDefault();                      // prevents page reload
        log(`submit   -> Submitted: ${username.value}   (default prevented)`);
    });
    username.addEventListener("input", (e) => log(`input    -> Current value: ${e.target.value}`));
    username.addEventListener("focus", () => log("focus"));
    username.addEventListener("blur", () => log("blur"));
    $("#colour-select").addEventListener("change", (e) => log(`change   -> ${e.target.value}`));
}

// 5.7 + 5.8 Bubbling, capturing, stopPropagation, preventDefault
{
    const log = writer("out-bubble", 8);
    const outer = $("#outer");
    const inner = $("#inner");
    const stop = $("#stop-toggle");
    const capture = $("#capture-toggle");

    outer.addEventListener("click", () => log("Outer clicked (bubbling)"));
    outer.addEventListener("click", () => log("Outer clicked (capturing phase)"), true);
    inner.addEventListener("click", (event) => {
        if (stop.checked) event.stopPropagation();
        log(stop.checked ? "Inner clicked — stopPropagation() called" : "Inner clicked");
    });

    // capture listener is only audible when the box is ticked
    capture.addEventListener("change", () => outer.classList.toggle("show-capture", capture.checked));

    $("#prevent-link").addEventListener("click", (event) => {
        event.preventDefault();                      // prevents navigation
        log("Link clicked but not followed");
    });
}

// 5.9 Event delegation
{
    const log = writer("out-delegate", 5);
    const taskList = $("#delegate-list");
    taskList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            event.target.classList.toggle("done");
            log(`Clicked: ${event.target.textContent}`);
        }
    });
    $("#delegate-add").addEventListener("click", () => {
        const li = document.createElement("li");
        li.textContent = `Task ${taskList.children.length + 1} (added later)`;
        taskList.appendChild(li);                    // no listener attached to it — delegation covers it
        log(`Added "${li.textContent}" — no new listener needed`);
    });
}

// 8. Waiting for DOM load
document.addEventListener("DOMContentLoaded", () => {
    $("#out-ready").textContent = "DOMContentLoaded fired — safe to touch the DOM.";
});
