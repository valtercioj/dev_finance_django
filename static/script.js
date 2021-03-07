const Modal = {
  modalClasses: document.querySelector(".modal-overlay").classList,
  toogle() {
    Modal.modalClasses.contains("active")
      ? Modal.modalClasses.remove("active")
      : Modal.modalClasses.add("active")
  },
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    )
  },
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) income += transaction.amount
    })

    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) expense += transaction.amount
    })

    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  },
}

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr")
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  },

  innerHTMLTransaction(transaction, index) {
    const { description, amount, date } = transaction

    const CSSclass = amount > 0 ? "income" : "expense"
    const amountFormated = Utils.formatCurrency(amount)

    const html = `
      <tr>
        <td class="description">${description}</td>
        <td class="${CSSclass}">${amountFormated}</td>
        <td class="date">${date}</td>
        <td>
          <img onClick="Transaction.remove(${index})" src="https://raw.githubusercontent.com/devzgabriel/dev.finance/main/assets/minus.svg" alt="Remover transação" />
        </td>
      </tr>
    `

    return html
  },

  updateBalance() {
    const incomeDisplay = (document.querySelector(
      "#incomeDisplay"
    ).innerHTML = Utils.formatCurrency(Transaction.incomes()))

    const expenseDisplay = (document.querySelector(
      "#expenseDisplay"
    ).innerHTML = Utils.formatCurrency(Transaction.expenses()))

    const totalDisplay = (document.querySelector(
      "#totalDisplay"
    ).innerHTML = Utils.formatCurrency(Transaction.total()))
  },
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    return signal + " " + value
  },
  formatAmount(value) {
    return Number(value.replace(/\,\.\-/g, "")) * 100
  },
  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  toogleDarkMode() {
    header = document.querySelector("header").classList
    body = document.querySelector("body").classList
    footer = document.querySelector("footer").classList
    buttonDark = document.querySelector("button.toDark").classList
    if (body.contains("dark")) {
      body.remove("dark")
      header.remove("dark")
      footer.remove("dark")
      buttonDark.remove("dark")
    } else {
      body.add("dark")
      header.add("dark")
      footer.add("dark")
      buttonDark.add("dark")
    }
  },
}

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  expense: document.querySelector("input#expense"),
  situation: "",

  getValues() {
    Form.getSituation()
    return {
      description: Form.description.value,
      amount: Form.situation + String(Form.amount.value),
      date: Form.date.value,
    }
  },

  getSituation() {
    Form.situation = Form.expense.checked ? "-" : ""
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha os campos!")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date,
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
    Form.expense.checked = false
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.toogle()
      App.reload()
    } catch (error) {
      alert(error.message)
    }
  },
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()