class TimeError extends Error{
    constructor(message){
        super(message)
    }
}

export let idValidityError =  new Error("У Вас немає доступу до користувачів, дані яких Ви намагаєтесь змінити!");
export let timeError =  new TimeError("Нажаль замовляти після 9 години не можна!");
export let scriptError = function (e){
    if(e instanceof TimeError){
        return e.message
    }
    return `Сталася помилка. Повторіть запит ще раз та, по можливості, повідомте про неї адміністратора! \n Текст помилки: ${e.message}`
}

export let loginError = new Error("Неправильний логін або пароль!")
export let unforseenError = new Error("Йой, сталася непередбачувана помилка, повідомте про неї адміністратора!")
export let userTypeError = new Error("Такого типу користувача не існує!")
export let accessError = new Error("У вас немає доступу до даної сторінки!")
export let successMessage = "Ваш запит успішно опрацьовано!"