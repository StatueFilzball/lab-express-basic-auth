const isLoggedIn = (req, res, next) => {
    if (req.session.currentUser) {
        next()
    }
    else {
        return res.redirect("auth/login")
    }
}


const isLoggedOut = (req, res, next) => {
if (!req.session.currentUser) {
    next
}
else {
    return res.redirect("/")
}
}

module.exports = {
    isLoggedIn,
    isLoggedOut
}