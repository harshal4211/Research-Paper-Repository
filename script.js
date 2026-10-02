// =====================================================
// RESEARCH PAPER REPOSITORY
// AVL TREE + PDF UPLOAD + UPDATE MANAGEMENT
// =====================================================


class AVLNode {

    constructor(key, paper) {

        this.key = key;

        this.paper = paper;

        this.left = null;

        this.right = null;

        this.height = 1;
    }
}



class AVLTree {


    // =================================================
    // HEIGHT
    // =================================================

    getHeight(node) {

        return node
            ? node.height
            : 0;
    }


    // =================================================
    // BALANCE FACTOR
    // =================================================

    getBalance(node) {

        return node
            ? this.getHeight(node.left) -
              this.getHeight(node.right)
            : 0;
    }


    // =================================================
    // UPDATE HEIGHT
    // =================================================

    updateHeight(node) {

        node.height =
            1 +
            Math.max(
                this.getHeight(node.left),
                this.getHeight(node.right)
            );
    }


    // =================================================
    // RIGHT ROTATION
    // =================================================

    rightRotate(y) {

        const x = y.left;

        const T2 = x.right;


        x.right = y;

        y.left = T2;


        this.updateHeight(y);

        this.updateHeight(x);


        return x;
    }


    // =================================================
    // LEFT ROTATION
    // =================================================

    leftRotate(x) {

        const y = x.right;

        const T2 = y.left;


        y.left = x;

        x.right = T2;


        this.updateHeight(x);

        this.updateHeight(y);


        return y;
    }


    // =================================================
    // INSERT
    // =================================================

    insert(node, key, paper) {

        if (!node) {

            return new AVLNode(
                key,
                paper
            );
        }


        if (key < node.key) {

            node.left =
                this.insert(
                    node.left,
                    key,
                    paper
                );
        }


        else if (key > node.key) {

            node.right =
                this.insert(
                    node.right,
                    key,
                    paper
                );
        }


        else {

            return node;
        }


        this.updateHeight(node);


        const balance =
            this.getBalance(node);


        // LL

        if (
            balance > 1 &&
            key < node.left.key
        ) {

            return this.rightRotate(node);
        }


        // RR

        if (
            balance < -1 &&
            key > node.right.key
        ) {

            return this.leftRotate(node);
        }


        // LR

        if (
            balance > 1 &&
            key > node.left.key
        ) {

            node.left =
                this.leftRotate(
                    node.left
                );

            return this.rightRotate(node);
        }


        // RL

        if (
            balance < -1 &&
            key < node.right.key
        ) {

            node.right =
                this.rightRotate(
                    node.right
                );

            return this.leftRotate(node);
        }


        return node;
    }


    // =================================================
    // SEARCH
    // =================================================

    search(node, key) {

        if (!node) {

            return null;
        }


        if (key === node.key) {

            return node.paper;
        }


        if (key < node.key) {

            return this.search(
                node.left,
                key
            );
        }


        return this.search(
            node.right,
            key
        );
    }


    // =================================================
    // MINIMUM NODE
    // =================================================

    getMinValueNode(node) {

        let current = node;


        while (current.left) {

            current =
                current.left;
        }


        return current;
    }


    // =================================================
    // DELETE
    // =================================================

    delete(node, key) {

        if (!node) {

            return node;
        }


        if (key < node.key) {

            node.left =
                this.delete(
                    node.left,
                    key
                );
        }


        else if (key > node.key) {

            node.right =
                this.delete(
                    node.right,
                    key
                );
        }


        else {

            if (
                !node.left ||
                !node.right
            ) {

                node =
                    node.left ||
                    node.right ||
                    null;
            }


            else {

                const temp =
                    this.getMinValueNode(
                        node.right
                    );


                node.key =
                    temp.key;


                node.paper =
                    temp.paper;


                node.right =
                    this.delete(
                        node.right,
                        temp.key
                    );
            }
        }


        if (!node) {

            return node;
        }


        this.updateHeight(node);


        const balance =
            this.getBalance(node);


        // LL

        if (
            balance > 1 &&
            this.getBalance(
                node.left
            ) >= 0
        ) {

            return this.rightRotate(node);
        }


        // LR

        if (
            balance > 1 &&
            this.getBalance(
                node.left
            ) < 0
        ) {

            node.left =
                this.leftRotate(
                    node.left
                );

            return this.rightRotate(node);
        }


        // RR

        if (
            balance < -1 &&
            this.getBalance(
                node.right
            ) <= 0
        ) {

            return this.leftRotate(node);
        }


        // RL

        if (
            balance < -1 &&
            this.getBalance(
                node.right
            ) > 0
        ) {

            node.right =
                this.rightRotate(
                    node.right
                );

            return this.leftRotate(node);
        }


        return node;
    }
}



// =====================================================
// GLOBAL DATA
// =====================================================

const avlTree =
    new AVLTree();


let root = null;


let papers = [];


let editingPaperId = null;



// =====================================================
// SAVE DATA
// =====================================================

function saveData() {

    localStorage.setItem(
        "researchPapers",
        JSON.stringify(papers)
    );
}



// =====================================================
// LOAD DATA
// =====================================================

function loadData() {

    const saved =
        localStorage.getItem(
            "researchPapers"
        );


    if (saved) {

        try {

            papers =
                JSON.parse(saved);

        }
        catch (error) {

            console.error(
                "Error loading papers:",
                error
            );

            papers = [];
        }
    }


    rebuildAVL();

    displayPapers();

    updateStatistics();

    drawAVLTree();
}



// =====================================================
// REBUILD AVL
// =====================================================

function rebuildAVL() {

    root = null;


    papers.forEach(paper => {

        root =
            avlTree.insert(
                root,
                Number(paper.id),
                paper
            );
    });
}



// =====================================================
// PDF FILE TO BASE64
// =====================================================

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(
                    reader.result
                );
            };


            reader.onerror = () => {

                reject(
                    reader.error
                );
            };


            reader.readAsDataURL(file);
        }
    );
}



// =====================================================
// FORM SUBMIT
// =====================================================

const paperForm =
    document.getElementById(
        "paperForm"
    );


if (paperForm) {

    paperForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // =========================================
            // GET FORM DATA
            // =========================================

            const id =
                Number(
                    document
                        .getElementById(
                            "paperId"
                        )
                        .value
                );


            const title =
                document
                    .getElementById(
                        "title"
                    )
                    .value
                    .trim();


            const author =
                document
                    .getElementById(
                        "author"
                    )
                    .value
                    .trim();


            const year =
                document
                    .getElementById(
                        "year"
                    )
                    .value;


            const category =
                document
                    .getElementById(
                        "category"
                    )
                    .value
                    .trim();


            const journal =
                document
                    .getElementById(
                        "journal"
                    )
                    .value
                    .trim();


            const abstract =
                document
                    .getElementById(
                        "abstract"
                    )
                    .value
                    .trim();


            // =========================================
            // GET PDF
            // =========================================

            const fileInput =
                document.getElementById(
                    "paperFile"
                );


            const paperFile =
                fileInput &&
                fileInput.files.length > 0
                    ? fileInput.files[0]
                    : null;


            // =========================================
            // PDF VALIDATION
            // =========================================

            if (paperFile) {

                if (
                    paperFile.type !==
                    "application/pdf"
                ) {

                    alert(
                        "Please select a PDF file only."
                    );

                    return;
                }


                // 5 MB limit

                if (
                    paperFile.size >
                    5 * 1024 * 1024
                ) {

                    alert(
                        "PDF size must be less than 5 MB."
                    );

                    return;
                }
            }


            // =========================================
            // UPDATE EXISTING PAPER
            // =========================================

            if (
                editingPaperId !== null
            ) {

                const index =
                    papers.findIndex(
                        paper =>
                            Number(
                                paper.id
                            ) ===
                            Number(
                                editingPaperId
                            )
                    );


                if (index === -1) {

                    alert(
                        "Paper not found!"
                    );

                    return;
                }


                // Keep old PDF if
                // no new PDF selected

                let pdfData =
                    papers[index].pdf ||
                    "";


                let pdfName =
                    papers[index].pdfName ||
                    "";


                // New PDF selected

                if (paperFile) {

                    pdfData =
                        await fileToBase64(
                            paperFile
                        );


                    pdfName =
                        paperFile.name;
                }


                papers[index] = {

                    id:
                        Number(
                            editingPaperId
                        ),

                    title:
                        title,

                    author:
                        author,

                    year:
                        year,

                    category:
                        category,

                    journal:
                        journal,

                    abstract:
                        abstract,

                    pdf:
                        pdfData,

                    pdfName:
                        pdfName
                };


                saveData();

                rebuildAVL();

                displayPapers();

                updateStatistics();

                drawAVLTree();


                editingPaperId =
                    null;


                paperForm.reset();

                resetFormButton();


                alert(
                    "Research Paper updated successfully!"
                );


                return;
            }



            // =========================================
            // CHECK DUPLICATE ID
            // =========================================

            if (
                avlTree.search(
                    root,
                    id
                ) !== null
            ) {

                alert(
                    "Paper ID already exists!"
                );

                return;
            }



            // =========================================
            // PDF DATA
            // =========================================

            let pdfData = "";

            let pdfName = "";


            if (paperFile) {

                pdfData =
                    await fileToBase64(
                        paperFile
                    );

                pdfName =
                    paperFile.name;
            }



            // =========================================
            // CREATE PAPER
            // =========================================

            const paper = {

                id:
                    id,

                title:
                    title,

                author:
                    author,

                year:
                    year,

                category:
                    category,

                journal:
                    journal,

                abstract:
                    abstract,

                pdf:
                    pdfData,

                pdfName:
                    pdfName
            };



            // =========================================
            // ADD TO ARRAY
            // =========================================

            papers.push(
                paper
            );



            // =========================================
            // ADD TO AVL
            // =========================================

            root =
                avlTree.insert(
                    root,
                    id,
                    paper
                );



            // =========================================
            // SAVE
            // =========================================

            saveData();

            displayPapers();

            updateStatistics();

            drawAVLTree();


            paperForm.reset();

            resetFormButton();


            alert(
                "Research Paper added successfully!"
            );
        }
    );
}



// =====================================================
// DISPLAY PAPERS
// =====================================================

function displayPapers(
    list = papers
) {

    const container =
        document.getElementById(
            "paperList"
        );


    if (!container) {

        return;
    }


    container.innerHTML = "";


    if (
        list.length === 0
    ) {

        container.innerHTML =
            `
            <p>
                No research papers found.
            </p>
            `;

        return;
    }



    list.forEach(
        paper => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "paper-card";



            card.innerHTML = `

                <div class="paper-id">
                    Paper ID: ${paper.id}
                </div>


                <h3>
                    ${escapeHTML(
                        paper.title
                    )}
                </h3>


                <p>
                    <strong>
                        Author:
                    </strong>
                    ${escapeHTML(
                        paper.author
                    )}
                </p>


                <p>
                    <strong>
                        Year:
                    </strong>
                    ${paper.year}
                </p>


                <p>
                    <strong>
                        Category:
                    </strong>
                    ${escapeHTML(
                        paper.category
                    )}
                </p>


                <p>
                    <strong>
                        Journal:
                    </strong>
                    ${escapeHTML(
                        paper.journal
                    )}
                </p>


                <div class="paper-actions">


                    <button
                        onclick="
                            viewPaper(
                                ${paper.id}
                            )
                        "
                    >
                        View
                    </button>


                    <button
                        onclick="
                            editPaper(
                                ${paper.id}
                            )
                        "
                    >
                        Edit
                    </button>


                    <button
                        onclick="
                            deletePaper(
                                ${paper.id}
                            )
                        "
                    >
                        Delete
                    </button>


${
    paper.pdf
    ?
    `
    <a
        href="${paper.pdf}"
        target="_blank"
        class="pdf-button"
    >
        📄 View PDF
    </a>

    <button
        type="button"
        onclick="removePDF(${paper.id})"
        class="remove-pdf-button"
    >
        🗑 Remove PDF
    </button>
    `
    :
    ""
}

                </div>

            `;


            container.appendChild(
                card
            );
        }
    );
}



// =====================================================
// EDIT PAPER
// =====================================================

function editPaper(id) {

    const paper =
        papers.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if (!paper) {

        alert(
            "Paper not found!"
        );

        return;
    }


    editingPaperId =
        Number(id);



    document.getElementById(
        "paperId"
    ).value =
        paper.id;


    document.getElementById(
        "title"
    ).value =
        paper.title;


    document.getElementById(
        "author"
    ).value =
        paper.author;


    document.getElementById(
        "year"
    ).value =
        paper.year;


    document.getElementById(
        "category"
    ).value =
        paper.category;


    document.getElementById(
        "journal"
    ).value =
        paper.journal;


    document.getElementById(
        "abstract"
    ).value =
        paper.abstract;



    // =========================================
    // CHANGE BUTTON TEXT
    // =========================================

    const button =
        paperForm.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.textContent =
            "Update Research Paper";
    }



    // =========================================
    // CANCEL BUTTON
    // =========================================

    let cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (!cancelButton) {

        cancelButton =
            document.createElement(
                "button"
            );


        cancelButton.id =
            "cancelEdit";


        cancelButton.type =
            "button";


        cancelButton.textContent =
            "Cancel Edit";


        cancelButton.style.marginTop =
            "10px";


        cancelButton.style.background =
            "#475569";


        cancelButton.style.color =
            "white";


        cancelButton.style.border =
            "none";


        cancelButton.style.padding =
            "10px";


        cancelButton.style.borderRadius =
            "6px";


        button.parentNode.appendChild(
            cancelButton
        );


        cancelButton.addEventListener(
            "click",
            cancelEdit
        );
    }



    document
        .getElementById(
            "add"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}



// =====================================================
// CANCEL EDIT
// =====================================================

function cancelEdit() {

    editingPaperId =
        null;


    paperForm.reset();


    resetFormButton();
}



// =====================================================
// RESET FORM BUTTON
// =====================================================

function resetFormButton() {

    const button =
        paperForm.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.textContent =
            "Add Paper to Repository";
    }


    const cancel =
        document.getElementById(
            "cancelEdit"
        );


    if (cancel) {

        cancel.remove();
    }
}
// =====================================================
// REMOVE PDF ONLY
// =====================================================

function removePDF(id) {

    const paper =
        papers.find(
            p =>
                Number(p.id) ===
                Number(id)
        );

    if (!paper) {
        alert("Paper not found!");
        return;
    }

    if (!paper.pdf) {
        alert("No PDF uploaded!");
        return;
    }

    const confirmRemove =
        confirm(
            `Remove PDF from "${paper.title}"?`
        );

    if (!confirmRemove) {
        return;
    }

    paper.pdf = "";
    paper.pdfName = "";

    saveData();

    rebuildAVL();

    displayPapers();

    updateStatistics();

    drawAVLTree();

    alert("PDF removed successfully!");
}


// =====================================================
// DELETE PAPER
// =====================================================

function deletePaper(id) {

    const paper =
        avlTree.search(
            root,
            Number(id)
        );


    if (!paper) {

        alert(
            "Paper not found!"
        );

        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${paper.title}"?`
        );


    if (!confirmDelete) {

        return;
    }


    root =
        avlTree.delete(
            root,
            Number(id)
        );


    papers =
        papers.filter(
            paper =>
                Number(paper.id) !==
                Number(id)
        );


    saveData();

    displayPapers();

    updateStatistics();

    drawAVLTree();


    alert(
        "Research Paper deleted successfully!"
    );
}



// =====================================================
// VIEW PAPER
// =====================================================

function viewPaper(id) {

    const paper =
        avlTree.search(
            root,
            Number(id)
        );


    if (!paper) {

        alert(
            "Paper not found!"
        );

        return;
    }


    alert(

        "Paper ID: " +
        paper.id +

        "\n\nTitle: " +
        paper.title +

        "\n\nAuthor: " +
        paper.author +

        "\n\nYear: " +
        paper.year +

        "\n\nCategory: " +
        paper.category +

        "\n\nJournal: " +
        paper.journal +

        "\n\nAbstract:\n" +
        paper.abstract +

        (
            paper.pdfName
            ?
            "\n\nPDF: " +
            paper.pdfName
            :
            ""
        )
    );
}



// =====================================================
// SEARCH
// =====================================================

function searchPapers() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {

        return;
    }


    const search =
        input.value
            .trim()
            .toLowerCase();


    if (!search) {

        displayPapers();

        return;
    }



    // =========================================
    // SEARCH BY PAPER ID USING AVL
    // =========================================

    if (!isNaN(search)) {

        const result =
            avlTree.search(
                root,
                Number(search)
            );


        if (result) {

            displayPapers(
                [result]
            );

            return;
        }
    }



    // =========================================
    // TEXT SEARCH
    // =========================================

    const results =
        papers.filter(
            paper =>

                paper.title
                    .toLowerCase()
                    .includes(search)

                ||

                paper.author
                    .toLowerCase()
                    .includes(search)

                ||

                paper.category
                    .toLowerCase()
                    .includes(search)

                ||

                paper.journal
                    .toLowerCase()
                    .includes(search)
        );


    displayPapers(
        results
    );
}



// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        document.getElementById(
            "totalPapers"
        );


    if (total) {

        total.innerText =
            papers.length;
    }



    const authors =
        new Set(
            papers.map(
                paper =>
                    paper.author
            )
        );


    const authorElement =
        document.getElementById(
            "totalAuthors"
        );


    if (authorElement) {

        authorElement.innerText =
            authors.size;
    }



    const categories =
        new Set(
            papers.map(
                paper =>
                    paper.category
            )
        );


    const categoryElement =
        document.getElementById(
            "totalCategories"
        );


    if (categoryElement) {

        categoryElement.innerText =
            categories.size;
    }



    const heightElement =
        document.getElementById(
            "avlHeight"
        );


    if (heightElement) {

        heightElement.innerText =
            avlTree.getHeight(
                root
            );
    }
}



// =====================================================
// AVL TREE VISUALIZATION
// =====================================================

function drawAVLTree() {

    const container =
        document.getElementById(
            "treeContainer"
        );


    if (!container) {

        return;
    }


    container.innerHTML = "";


    if (!root) {

        container.innerHTML =
            `
            <p>
                AVL Tree is empty
            </p>
            `;

        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "tree-wrapper";


    renderTreeNode(
        root,
        wrapper
    );


    container.appendChild(
        wrapper
    );
}



// =====================================================
// RENDER AVL NODE
// =====================================================

function renderTreeNode(
    node,
    parent
) {

    if (!node) {

        return;
    }


    const nodeElement =
        document.createElement(
            "div"
        );


    nodeElement.className =
        "avl-node";


    nodeElement.innerHTML = `

        <div class="node-circle">
            ${node.key}
        </div>

        <small>
            H: ${node.height}
        </small>

    `;


    parent.appendChild(
        nodeElement
    );


    if (
        node.left ||
        node.right
    ) {

        const children =
            document.createElement(
                "div"
            );


        children.className =
            "tree-children";


        const left =
            document.createElement(
                "div"
            );


        left.className =
            "tree-child";


        const right =
            document.createElement(
                "div"
            );


        right.className =
            "tree-child";


        if (node.left) {

            renderTreeNode(
                node.left,
                left
            );
        }


        if (node.right) {

            renderTreeNode(
                node.right,
                right
            );
        }


        children.appendChild(
            left
        );


        children.appendChild(
            right
        );


        parent.appendChild(
            children
        );
    }
}



// =====================================================
// SECURITY
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}



function escapeAttribute(value) {

    return String(value)

        .replaceAll(
            '"',
            "%22"
        )

        .replaceAll(
            "'",
            "%27"
        );
}



// =====================================================
// CATEGORY FILTER
// =====================================================

function updateCategoryFilter() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (!filter) {

        return;
    }


    const currentValue =
        filter.value;


    const categories =
        [
            ...new Set(
                papers.map(
                    paper =>
                        paper.category
                )
            )
        ]
        .sort();


    filter.innerHTML =
        `
        <option value="">
            All Categories
        </option>
        `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            filter.appendChild(
                option
            );
        }
    );


    filter.value =
        currentValue;
}



// =====================================================
// FILTER BY CATEGORY
// =====================================================

function filterByCategory() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (!filter) {

        return;
    }


    const category =
        filter.value;


    if (!category) {

        searchPapers();

        return;
    }


    const results =
        papers.filter(
            paper =>
                paper.category ===
                category
        );


    displayPapers(
        results
    );
}



// =====================================================
// CLEAR FILTERS
// =====================================================

function clearFilters() {

    const search =
        document.getElementById(
            "searchInput"
        );


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (search) {

        search.value = "";
    }


    if (filter) {

        filter.value = "";
    }


    displayPapers();
}



// =====================================================
// UPDATE CATEGORY WHEN STATISTICS UPDATE
// =====================================================

const originalUpdateStatistics =
    updateStatistics;


updateStatistics =
    function() {

        originalUpdateStatistics();

        updateCategoryFilter();
    };



// =====================================================
// START APPLICATION
// =====================================================

loadData();

updateCategoryFilter();