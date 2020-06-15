let myobj, budget, expenseName, expenseAmount, timer, count = -1;
let contentHolder = document.querySelector("#content");
let tableHolder = document.querySelector("#expenseList");
let message = document.querySelector("#message");
let showBudget = document.querySelector("#showBudget").firstElementChild.firstElementChild;
let showExpense = document.querySelector("#showExpense").firstElementChild.firstElementChild;
let showBalance = document.querySelector("#showBalance").firstElementChild.firstElementChild;
let deleteMusic = new Audio("sound/delete-sound-effect.mp3");
let errorMusic = new Audio("sound/error-sound-effect.mp3");
let expenseBar = document.querySelector("#myExpenseBar");

window.onload = function() {
    let array = document.cookie.split("=");
    if (array == "") {
        myobj = {
            'budget': 0,
            'totalExpense': 0,
            'expense': [],
            'balance': 0
        };
    } else {
        myobj = JSON.parse(array[1]);
        try {
            count = myobj.expense[myobj.expense.length - 1]['entryNo'];
            for (let i = 0; i < myobj.expense.length; i++) {
                addTableRow(myobj.expense[i]);
            }
        } catch (e) {
            myobj.totalExpense = 0;
        } finally {
            show();
        }
    }
    barAnimation();
}

function show() {
    showBudget.textContent = myobj.budget;
    showExpense.textContent = myobj.totalExpense;
    showBalance.textContent = myobj.balance;
}

function barAnimation() {
    if (myobj.budget === myobj.balance) {
        expenseBar.style.width = "0";
    } else {
        if (myobj.balance <= 0) {
            expenseBar.style.width = "100%";
        } else {
            let width = (myobj.totalExpense / myobj.budget) * 100;
            expenseBar.style.width = width + "%";
        }
    }
    setTimeout(barAnimation, 10);
}

function invalidValue(e) {
    message.firstElementChild.textContent = e;
    message.style.display = "block";
    errorMusic.play();

    if (timer == null) {
        timer = setInterval(() => {
            clearInterval(timer);
            timer = null;
            message.style.display = "none";
        }, 3000);
    }
}

function resetCookie() {
    try {
        document.cookie = "data=" + JSON.stringify(myobj) + ";max-age=" + (60 * 60 * 24 * 30) + ";secure";
    } catch (e) {
        invalidValue(e);
    }
}

function deleteEntry(tr, type) {
    const itemNo = tr.firstElementChild.getAttribute("entryNo");
    let newExpense = []
    for (let i = 0; i < myobj.expense.length; i++) {
        if (myobj.expense[i].entryNo == itemNo) {
            myobj.balance += myobj.expense[i].amount;
            myobj.totalExpense -= myobj.expense[i].amount;
            show();
            if (type === "edit") {
                document.querySelector("#expenseName").value = myobj.expense[i].name;
                document.querySelector("#expenseAmount").value = myobj.expense[i].amount;
            }
            continue;
        }
        newExpense.push(myobj.expense[i]);
    }
    tableHolder.removeChild(tr);
    myobj.expense = newExpense;
    resetCookie();
}

function addTableRow(entry) {
    let tr, tdTitle, tdValue, tdDate, tdButton, buttonEdit, buttonDelete, imgEdit, imgDelete;

    tr = document.createElement("tr");

    tdTitle = document.createElement("td");
    tdTitle.classList.add("title");
    tdTitle.textContent = "- " + entry.name;
    tdTitle.setAttribute("entryNo", entry.entryNo);

    tdValue = document.createElement("td");
    tdValue.classList.add("value");
    tdValue.textContent = entry.amount;

    tdDate = document.createElement("td");
    tdDate.classList.add("date");
    tdDate.textContent = entry.date;

    tdButton = document.createElement("td");
    tdButton.classList.add("button");

    buttonEdit = document.createElement("button");
    buttonEdit.classList.add("edit");

    buttonDelete = document.createElement("button");
    buttonDelete.classList.add("delete");

    imgEdit = document.createElement("img");
    imgEdit.setAttribute("src", "https://img.icons8.com/color/48/000000/pencil-tip.png");

    imgDelete = document.createElement("img");
    imgDelete.setAttribute("src", "https://img.icons8.com/color/48/000000/delete.png");

    buttonEdit.appendChild(imgEdit);
    buttonDelete.appendChild(imgDelete);

    tdButton.appendChild(buttonEdit);
    tdButton.appendChild(buttonDelete);

    tr.appendChild(tdTitle);
    tr.appendChild(tdValue);
    tr.appendChild(tdDate);
    tr.appendChild(tdButton);

    tableHolder.appendChild(tr);
}

contentHolder.addEventListener("mouseover", function(e) {
    if (e.target.id == "calculate") {
        e.target.style.backgroundColor = "green";
        e.target.style.color = "white";
    }
    if (e.target.id == "add") {
        e.target.style.backgroundColor = "maroon";
        e.target.style.color = "white";
    }
    e.stopPropagation();
});

contentHolder.addEventListener("mouseout", function(e) {
    if (e.target.id == "calculate" || e.target.id == "add") {
        e.target.style.backgroundColor = "white";
        e.target.style.color = "black";
        if (e.target.id == "calculate")
            e.target.style.border = "1px solid green";
        else
            e.target.style.border = "1px solid maroon";
    }
    e.stopPropagation();
});

contentHolder.addEventListener("click", function(e) {
    if (e.target.tagName == "BUTTON") {
        if (e.target.id == "calculate") {
            try {
                budget = Number(document.querySelector("#budgetAmount").value);
                if (budget < 0 || budget == "")
                    throw "Value cannot be Empty or Negative";
                myobj.budget = budget;
                myobj.balance = myobj.budget - myobj.totalExpense;
                resetCookie();
                show();
                document.querySelector("#budgetAmount").value = null;
            } catch (e) {
                invalidValue(e);
            }
        }
        if (e.target.id == "add") {
            try {
                expenseName = document.querySelector("#expenseName").value;
                expenseAmount = Number(document.querySelector("#expenseAmount").value)
                if (expenseAmount < 0 || expenseAmount == "" || expenseName == "")
                    throw "Value cannot be Empty or Negative";
                count += 1;
                let tempObj = {
                    'name': expenseName,
                    'amount': expenseAmount,
                    'date': new Date().toLocaleDateString(),
                    'entryNo': count
                };
                myobj.expense.push(tempObj);
                myobj.totalExpense = myobj.totalExpense + expenseAmount;
                myobj.balance = myobj.budget - myobj.totalExpense;
                show();
                resetCookie();
                addTableRow(tempObj);
                document.querySelector("#expenseName").value = null;
                document.querySelector("#expenseAmount").value = null;
            } catch (e) {
                invalidValue(e);
            }
        }
    }
    e.preventDefault();
    e.stopPropagation();
});

tableHolder.addEventListener("click", function(e) {
    if (e.target.tagName == "IMG") {
        const tr = e.target.parentNode.parentNode.parentNode;
        if (e.target.parentNode.className == "delete") {
            deleteMusic.play();
            deleteEntry(tr, "delete");
        }
        if (e.target.parentNode.className == "edit") {
            deleteEntry(tr, "edit");
        }
    }
    e.stopPropagation();
});