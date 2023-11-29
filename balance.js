
var formMode;
var indexItem;


// Module 1: Utilities (utils)
const utils = {
    formatCurrency(value) {
        let signal = Number(value) < 0 ? "-" : "+";
        if (Number(value) == 0) signal = "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        // Format currency as Indian Rupees
        value = value.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
        });
        return signal + value;
    },        // ... (formatting currency)

    formatDescription(description) {
        [firstLetter, ...restLetters] = description;
        description = [firstLetter.toUpperCase(), ...restLetters].join("");
        return description;
    },        // ... (formatting description)

    formatAmount(value) {
        value = Number(value) * 100;
        value = Math.round(value);
        return value;
    },        // ... (formatting amount)

    formatDate(date) {
        const splittedDate = date.split("-");
        let formattedDate = new Array();
        splittedDate.forEach((format) => formattedDate.unshift(format));
        formattedDate = formattedDate.join("/");
        return formattedDate;
    },        // ... (formatting date)

    unformatAmount(value) {
        value = Number(value) / 100;
        return value;
    },        // ... (unformatting amount)

    unformatDate(date) {
        const splittedDate = date.split("/");
        let formattedDate = new Array();
        splittedDate.forEach((format) => formattedDate.unshift(format));
        formattedDate = formattedDate.join("-");
        return formattedDate;
    },        // ... (unformatting date)

    unformatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "+";
        value = String(value).replace(/\D/g, "");
        value = Number(value);
        return parseInt(signal + value);
    },        // ... (unformatting currency)
};


// Module 2: Modal (Modal)

const Modal = {
    toggleState(mode) {
        formMode = mode;
        Form.clearFields();
        document.querySelector('.modal-overlay').classList.toggle('active');
    },        // ... (toggling modal state)

    toggleScreen(index, confirm) {
        document.querySelector('.modal-overlay-confirm').classList.toggle('active');
        if (confirm == 'yes') Transaction.remove(index);
    },        // ... (toggling confirmation modal)

    eventListener(eventStatus = false) {
        document.querySelector('.modal').addEventListener("click", () => (eventStatus = true));
        document.querySelector('.modal-overlay').addEventListener("click", () => {
            if (!eventStatus) Modal.toggleState();
            else eventStatus = false;
        });
    },        // ... (event listeners for modal)

};


// Module 3: Storage (Storage)

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('hide.finances:transactions')) || [];
    },        // ... (retrieving data from localStorage)

    set(transactions) {
        localStorage.setItem("hide.finances:transactions", JSON.stringify(transactions));
    },        // ... (setting data in localStorage)
};


//Module 4: Transaction (Transaction)

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        if (formMode == 'new') Transaction.all.push(transaction);
        else if (formMode == 'edit') {
            Transaction.all.splice(indexItem, 1);
            Transaction.all.push(transaction);
        }
        App.reload();
    },        // ... (adding or updating transaction)

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },        // ... (removing transaction)

    incomes() {
        let incomes = [0];
        Transaction.all.map((transactions) => {
            if (transactions.amount > 0) incomes.push(transactions.amount);
        });
        let totalIncomes = incomes.reduce((total, value) => total + value);
        totalIncomes = utils.formatCurrency(totalIncomes);
        return totalIncomes;
    },        // ... (calculating and formatting total income)

    expenses() {
        let expenses = [0];
        Transaction.all.map((transactions) => {
            if (transactions.amount < 0) expenses.push(transactions.amount);
        });
        let totalExpenses = expenses.reduce((total, value) => total + value);
        totalExpenses = utils.formatCurrency(totalExpenses);
        return totalExpenses;
    },        // ... (calculating and formatting total expenses)

    total() {
        let totalAmount = [0];
        let totalIncomes = utils.unformatCurrency(Transaction.incomes());
        let totalExpenses = utils.unformatCurrency(Transaction.expenses());
        totalAmount = totalIncomes - totalExpenses;
        if (totalAmount > 0) {
            document.querySelector('.card.total').classList.add('green');
            document.querySelector('.card.total').classList.remove('red');
        } else if (totalAmount < 0) {
            document.querySelector('.card.total').classList.add('red');
            document.querySelector('.card.total').classList.remove('green');
        } else document.querySelector('.card.total').classList.remove('red', 'green');
        totalAmount = utils.formatCurrency(totalAmount);
        return totalAmount;
    },        // ... (calculating and formatting total balance)

};
function updateBalance() {
    document.getElementById('incomes-display').innerHTML = Transaction.incomes();
    document.getElementById('expenses-display').innerHTML = Transaction.expenses();
    document.getElementById('total-amount-display').innerHTML = Transaction.total();
}

function addTransaction(transactions, index) {
    const transactionsContainer = document.querySelector('#data-table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = innerHTMLTransaction(transactions, index);
    index = tr.dataset.index;
    transactionsContainer.appendChild(tr);
    document.querySelector('#form h2').innerHTML = `New Transaction`;
}

function innerHTMLTransaction(transactions, index) {
    const formattedAmount = utils.formatCurrency(transactions.amount);
    const CSSClass = transactions.amount > 0 ? "income" : "expense";
    const html = `
        <td class="description">${transactions.description}</td>
        <td class="${CSSClass}">${formattedAmount}</td>
        <td class="date">${transactions.date}</td>
        <td class="icons-field">
            <img class="remove-icon" onclick="Modal.toggleScreen(${index})" src="delete.png" alt="remove transaction logo" height="50px" width="50px">
        </td>
    `;
    return html;
}

function clearTransactions() {
    document.querySelector('#data-table tbody').innerHTML = "";
    document.querySelector('#form h2').innerHTML = `New Transaction`;
}

// Module 5: Form (Form)

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },
    validateFields() {
        const { description, amount, date } = Form.getValues();
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Please fill in all fields!");
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues();
        description = utils.formatDescription(description);
        amount = utils.formatAmount(amount);
        date = utils.formatDate(date);
        return {
            description,
            amount,
            date,
        };
    },
    saveTransaction(transaction) {
        Transaction.add(transaction);
    },
    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Modal.toggleState('new');
            Form.clearFields();
        } catch (error) {
            alert(error.message);
        }
    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
};


// Module 6: Application (App)

const App = {
    init() {
        Transaction.all.forEach((transactions, index) => addTransaction(transactions, index));
        updateBalance();
        Storage.set(Transaction.all);
        Modal.eventListener();
    },
    reload() {
        clearTransactions();
        App.init();
    },
};

// Initialization of the Application

App.init();
