// dont load the whole page until all contents are available
document.addEventListener("DOMContentLoaded", function () {
    const notesContainer = document.getElementById("notesContainer");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const addNoteModal = document.getElementById("addNoteModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const noteForm = document.getElementById("noteForm");
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    const emptyState = document.getElementById("emptyState");
    const confirmModal = document.getElementById("confirmModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
// parse the recent notes stored by the user
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let noteToDeleteId = null;

    renderNotes();
    updateEmptyState();

    addNoteBtn.addEventListener("click", openAddNoteModal);
    closeModalBtn.addEventListener("click", closeAddNoteModal);
    noteForm.addEventListener("submit", handleNoteSubmit);
    searchInput.addEventListener("input", filterNotes);
    filterSelect.addEventListener("change", filterNotes);
    cancelDeleteBtn.addEventListener("click", closeConfirmModal);
    confirmDeleteBtn.addEventListener("click", confirmDeleteNote);

    function renderNotes(notesToRender = notes) {
        notesContainer.innerHTML = "";

        notesToRender.forEach((note, index) => {
            // we create a new div element for each note card
            const noteElement = document.createElement("div");
            noteElement.className = "note-card fade-in";
            // inside this we contain the title content tag and date
            noteElement.innerHTML = `
            <div class="note-content">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="delete-btn" data-id="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="note-text">${note.content}</p>
                <div class="note-footer">
                    <span class="note-tag ${getTagClass(note.tag)}">
                        ${getTagIcon(note.tag)} ${getTagName(note.tag)}
                    </span>
                    <span class="note-date">${formatDate(note.date)}</span>
                </div>
            </div>`;
            //once we made the note we append it to the notes container
            notesContainer.appendChild(noteElement);
        });
// when we created a note the event listener will listen to the delete event to happen and show a confirmination modal
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                noteToDeleteId = parseInt(this.getAttribute("data-id"));
                openConfirmModal();
            });
        });
    }
//when the tag is work it will return the class of the tag name 
// if we want to add new tags in future then we will update the objects
    function getTagClass(tag) {
        const classes = {
            work: "tag-work",
            personal: "tag-personal",
            ideas: "tag-ideas",
            reminders: "tag-reminders",
        };
        return classes[tag] || "";
    }
// return the icon of the respective class
    function getTagIcon(tag) {
        const icons = {
            work: '<i class="fas fa-briefcase"></i>',
            personal: '<i class="fas fa-user"></i>',
            ideas: '<i class="fas fa-lightbulb"></i>',
            reminders: '<i class="fas fa-bell"></i>',
        };
        return icons[tag] || "";
    }
// return tag name
    function getTagName(tag) {
        const names = {
            work: "Work",
            personal: "Personal",
            ideas: "Ideas",
            reminders: "Reminders",
        };
        return names[tag] || tag;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
// enables active class and disable scrolling on the body
    function openAddNoteModal() {
        addNoteModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
// when openAddNoteModal is executed then we have closeAddNoteModal function
    function closeAddNoteModal() {
        addNoteModal.classList.remove("active");
        document.body.style.overflow = "auto";
        noteForm.reset();
    }
// delete confirmination modal function
    function openConfirmModal() {
        confirmModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
// closing the delete confirmination modal window 
    function closeConfirmModal() {
        confirmModal.classList.remove("active");
        document.body.style.overflow = "auto";
        noteToDeleteId = null;// to ensure no node is selected to delete
    }
// handles the added note's information
    function handleNoteSubmit(e) {
        e.preventDefault();// otherwise it reloads the page

        const title = document.getElementById("noteTitle").value;
        const content = document.getElementById("noteContent").value;
        const tag = document.querySelector(
            'input[name="noteTag"]:checked'
        ).value;

        const newNote = {
            title,
            content,
            tag,
            date: new Date().toISOString(),
        };

        notes.unshift(newNote);// the newest node appears at the top
        saveNotes();//saves the note
        renderNotes();//to update the display 
        closeAddNoteModal();//close the modal
        updateEmptyState();//update
        filterNotes();// apply current filters
    }
//it removes the note from the array of notes using splice function
    function confirmDeleteNote() {
        if (noteToDeleteId !== null) {
            notes.splice(noteToDeleteId, 1);
            saveNotes();//to update local storage
            renderNotes();// re render to reflect the deletion
            updateEmptyState();
            filterNotes();
            closeConfirmModal();
        }
    }
// use local storage set items to store the current state of notes arra and convert it to string using stringify
    function saveNotes() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }
// works by checking both the search input and the selected filter tag
    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();// for case sensitive comparison
        const filterValue = filterSelect.value;

        let filteredNotes = notes;
// if the title or content contain that terms it checks it using includes
        if (searchTerm) {
            filteredNotes = filteredNotes.filter(
                (note) =>
                    note.title.toLowerCase().includes(searchTerm) ||
                    note.content.toLowerCase().includes(searchTerm)
            );
        }
// if a tag is selected we filter the notes tag by matching the notes tag with the selected one
// if note tag is selected we skip this step
        if (filterValue !== "all") {
            filteredNotes = filteredNotes.filter(
                (note) => note.tag === filterValue
            );
        }

        renderNotes(filteredNotes);// to display the results
        updateEmptyState(filteredNotes);// if there are no matching notes we update
    }
// if there  are no matching notes it will show a msg and if we have a note it will show the filtered note
    function updateEmptyState(notesToCheck = notes) {
        if (notesToCheck.length === 0) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
        }
    }
});