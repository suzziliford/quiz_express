module.exports = (req, res) => {
    // clear the jwtToken 
    res.cookie('jwtToken', '', { httpOnly: true });
    res.redirect('/auth/login');

}