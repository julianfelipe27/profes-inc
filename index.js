const db = firebase.firestore();
const addStudentForm = document.getElementById("formAddStudent");
const firstCardsContainer = document.getElementById("firstCardsContainer");
const secondCardsContainer = document.getElementById("secondCardsContainer");
const thirdCardsContainer = document.getElementById("thirdCardsContainer");


const closeModal = () => {
    document.getElementById("modalAddStudent").style = "display: none"
}
const openModal = () => {
    document.getElementById("modalAddStudent").style = "display: flex"
}

addStudentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let name = addStudentForm["nombreEstudiante"].value;
    let code = addStudentForm["codigoEstudiante"].value;
    let course = addStudentForm["cursoEstudiante"].value;
    let participations = 0;
    let existe = await validateStudent(code);
    console.log(existe);
    if (!existe) {
        document.getElementById("modalSubmitBtn").style = "display:none;"
        document.getElementById("loadingMessageDiv").style = "display:flex";
        db.collection("students").doc().set({
            name,
            code,
            course,
            participations
        })
        document.getElementById("loadingMessageDiv").style = "";
        document.getElementById("modalSubmitBtn").style = "display:block;"
        renderStudentsInCards();
    }
    else {
        alert("El estudiante con el codigo ingresado ya existe");
    }
    closeModal();
    resetFormFields();
})

const updateStudentParticipations = (code, name, course) => {
    let inputParticipations = document.getElementById("participation" + code);
    let btnStudent = document.getElementById("studentBtn" + code);
    let participations = parseInt(inputParticipations.getAttribute("value")) + 1;
    inputParticipations.setAttribute("value", participations);
    btnStudent.classList.add("disabled");
    btnStudent.setAttribute("disabled", "true");
    db.collection("students").where('code', '==', code).get().then(async (snapshot) => {
        await snapshot.docs[0].ref.update({
            code,
            name,
            course,
            participations
        }).then(() => {
            btnStudent.classList.remove("disabled");
            btnStudent.removeAttribute("disabled");
            btnStudent.innerText = participations;
            if (participations === 11 || participations === 6) {
                renderStudentsInCards();
            }
        });
    });

}

const removeStudent = (code) => {
    db.collection("students").where('code', '==', code).get().then(async (snapshot) => {
        await snapshot.docs[0].ref.delete().then(()=>{
            renderStudentsInCards();
        });
    });
}

const validateStudent = async (code) => {
    let existe = false;
    await db.collection("students").where('code', '==', code).get().then(async (snapshot) => {
      let st = snapshot.docs[0];
      if(st!==undefined) {
          existe = true;
      }
    });
    return existe;
}

const renderStudentsInCards = () => {
    firstCardsContainer.innerHTML = "";
    secondCardsContainer.innerHTML = "";
    thirdCardsContainer.innerHTML = "";
    db.collection("students").get().then(res => res.forEach(doc => {
        let name = doc.data().name;
        let code = doc.data().code;
        let course = doc.data().course;
        let participations = parseInt(doc.data().participations);

        if (participations > 10) {
            thirdCardsContainer.innerHTML += `<div class="card">
            <div class="title-card">
                <b>${course}</b>
            </div>
            <div class="body-card">
                <span><b>Estudiante:</b> ${name}</span>
                <span><b>Código: </b> ${code}</span>
            </div>
            <div class="action-card">
                <b>Participaciones</b>
                <input hidden id="participation${code}" value="${participations}">
                <button id="studentBtn${code}" onclick="updateStudentParticipations('${code}','${name}','${course}')" class="addParticipation">${participations}</button>
                <button id="removeBtn${code}" onclick="removeStudent('${code}')" class="removeParticipation">Eliminar</button>
            </div>
        </div>`
        }
        else if (participations > 5) {
            secondCardsContainer.innerHTML += `<div class="card">
            <div class="title-card">
                <b>${course}</b>
            </div>
            <div class="body-card">
                <span><b>Estudiante:</b> ${name}</span>
                <span><b>Código: </b> ${code}</span>
            </div>
            <div class="action-card">
                <b>Participaciones</b>
                <input hidden id="participation${code}" value="${participations}">
                <button id="studentBtn${code}" onclick="updateStudentParticipations('${code}','${name}','${course}')" class="addParticipation">${participations}</button>
                <button id="removeBtn${code}" onclick="removeStudent('${code}')" class="removeParticipation">Eliminar</button>
            </div>
        </div>`
        }
        else if (participations >= 0) {
            firstCardsContainer.innerHTML += `<div class="card">
            <div class="title-card">
                <b>${course}</b>
            </div>
            <div class="body-card">
                <span><b>Estudiante:</b> ${name}</span>
                <span><b>Código: </b> ${code}</span>
            </div>
            <div class="action-card">
                <b>Participaciones</b>
                <input hidden id="participation${code}" value="${participations}">
                <button id="studentBtn${code}" onclick="updateStudentParticipations('${code}','${name}','${course}')" class="addParticipation">${participations}</button>
                <button id="removeBtn${code}" onclick="removeStudent('${code}')" class="removeParticipation">Eliminar</button>
            </div>
        </div>`
        }
    }))
}

const resetFormFields = () => {

    addStudentForm["nombreEstudiante"].value = "";
    addStudentForm["codigoEstudiante"].value = "";
    addStudentForm["cursoEstudiante"].value = "";
}

window.addEventListener("DOMContentLoaded", (e) => {
    renderStudentsInCards();
})

