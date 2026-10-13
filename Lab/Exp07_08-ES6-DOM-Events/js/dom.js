// Part B — DOM manipulation, one live playground per manual section (4.2 – 4.8).
// Loaded as a module (deferred), so the DOM already exists and `$` stays file-local.

const $ = (sel, root = document) => root.querySelector(sel);

const report = (id, ...lines) => {
    $(`#${id}`).textContent = lines.join("\n");
};

// 4.2 Selecting elements
$("#run-select").addEventListener("click", () => {
    const container = document.getElementById("sel-container");
    const paragraphs = document.getElementsByClassName("sel-text");
    const byTag = container.getElementsByTagName("p");
    const firstPara = document.querySelector(".sel-text");
    const allParas = document.querySelectorAll(".sel-text");
    const texts = [];
    allParas.forEach(p => texts.push(p.textContent));
    report("out-select",
        `getElementById("sel-container")        -> <${container.tagName.toLowerCase()}>`,
        `getElementsByClassName("sel-text")      -> HTMLCollection(${paragraphs.length})`,
        `getElementsByTagName("p")               -> HTMLCollection(${byTag.length})`,
        `querySelector(".sel-text")              -> "${firstPara.textContent}"`,
        `querySelectorAll(".sel-text")           -> NodeList(${allParas.length}) ${JSON.stringify(texts)}`);
    allParas.forEach(p => p.classList.add("flash"));
    setTimeout(() => allParas.forEach(p => p.classList.remove("flash")), 700);
});

// 4.3 Modifying content
{
    const heading = $("#content-target");
    $("#btn-textcontent").addEventListener("click", () => { heading.textContent = "New Heading"; });
    $("#btn-innerhtml").addEventListener("click", () => { heading.innerHTML = "<em>Italic Heading</em>"; });
    $("#btn-innertext").addEventListener("click", () => { heading.innerText = "Visible Text"; });
    $("#btn-xss").addEventListener("click", () => {
        // Same payload through both properties: textContent shows it, innerHTML would parse it.
        const payload = '<img src=x onerror="document.title=\'XSS ran\'">';
        const safe = $("#xss-safe");
        const unsafe = $("#xss-unsafe");
        safe.textContent = payload;
        unsafe.innerHTML = payload.replace("onerror=\"document.title='XSS ran'\"", 'style="outline:2px solid #9c4221" width="40" height="20"');
        report("out-xss",
            "textContent shows the payload as inert text.",
            "innerHTML turned the same string into a real <img> element (see right).",
            "With a live onerror handler that would execute script — never feed user input to innerHTML.");
    });
}

// 4.4 Modifying attributes
{
    const link = $("#attr-link");
    const show = (title) => report("out-attr",
        title,
        `getAttribute("href")   -> ${link.getAttribute("href")}`,
        `getAttribute("target") -> ${link.getAttribute("target")}`,
        `link.href (resolved)   -> ${link.href}`);
    $("#btn-attr-get").addEventListener("click", () => show("get"));
    $("#btn-attr-set").addEventListener("click", () => {
        link.setAttribute("href", "https://example.com");
        link.setAttribute("target", "_blank");
        show("setAttribute href + target");
    });
    $("#btn-attr-remove").addEventListener("click", () => {
        link.removeAttribute("target");
        show("removeAttribute target");
    });
    $("#btn-attr-prop").addEventListener("click", () => {
        link.href = "https://developer.mozilla.org";
        show("link.href = ...");
    });
    $("#btn-attr-reset").addEventListener("click", () => {
        link.setAttribute("href", "#attr");
        link.removeAttribute("target");
        show("reset");
    });
    link.addEventListener("click", (e) => { e.preventDefault(); }); // keep the page where it is
}

// 4.5 Modifying styles
{
    const box = $("#style-box");
    const state = () => report("out-style",
        `style.backgroundColor = "${box.style.backgroundColor}"`,
        `style.fontSize        = "${box.style.fontSize}"`,
        `className             = "${box.className}"`,
        `classList.contains("active") -> ${box.classList.contains("active")}`);
    $("#btn-style-inline").addEventListener("click", () => {
        box.style.backgroundColor = "blue";
        box.style.fontSize = "20px";
        box.style.marginTop = "10px";
        state();
    });
    $("#btn-class-add").addEventListener("click", () => { box.classList.add("highlight"); state(); });
    $("#btn-class-remove").addEventListener("click", () => { box.classList.remove("highlight"); state(); });
    $("#btn-class-toggle").addEventListener("click", () => { box.classList.toggle("active"); state(); });
    $("#btn-style-reset").addEventListener("click", () => {
        box.removeAttribute("style");
        box.className = "box";
        state();
    });
    state();
}

// 4.6 + 4.7 Creating, adding and removing elements
{
    const container = $("#create-container");
    let n = 0;
    const make = (label) => {
        const div = document.createElement("div");
        div.textContent = `${label} #${++n}`;
        div.classList.add("card");
        return div;
    };
    $("#btn-append").addEventListener("click", () => container.appendChild(make("appendChild")));
    $("#btn-prepend").addEventListener("click", () => container.prepend(make("prepend")));
    $("#btn-insert-before").addEventListener("click", () => {
        const first = container.firstElementChild;
        container.insertBefore(make("insertBefore"), first);
    });
    $("#btn-before").addEventListener("click", () => {
        const last = container.lastElementChild;
        if (last) last.before(make("before")); else container.append(make("before"));
    });
    $("#btn-after").addEventListener("click", () => {
        const first = container.firstElementChild;
        if (first) first.after(make("after")); else container.append(make("after"));
    });
    $("#btn-remove-last").addEventListener("click", () => {
        const last = container.lastElementChild;
        if (last) last.remove();                         // modern way
    });
    $("#btn-remove-first").addEventListener("click", () => {
        const first = container.firstElementChild;
        if (first) first.parentNode.removeChild(first);  // old way
    });
}

// 4.8 Traversing the DOM
{
    const list = $("#trav-list");
    list.addEventListener("click", (event) => {
        const item = event.target.closest("li");
        if (!item) return;
        list.querySelectorAll("li").forEach(li => li.classList.remove("picked"));
        item.classList.add("picked");
        const name = (el) => el ? `"${el.textContent}"` : "null";
        report("out-traverse",
            `item                       -> ${name(item)}`,
            `parentElement              -> <${item.parentElement.tagName.toLowerCase()} id="${item.parentElement.id}">`,
            `children.length (of list)  -> ${item.parentElement.children.length}`,
            `firstElementChild (of list)-> ${name(item.parentElement.firstElementChild)}`,
            `lastElementChild (of list) -> ${name(item.parentElement.lastElementChild)}`,
            `previousElementSibling     -> ${name(item.previousElementSibling)}`,
            `nextElementSibling         -> ${name(item.nextElementSibling)}`);
    });
}
