const MainDashBoardRouter = require('express').Router();


MainDashBoardRouter.route('/')
    .get(require('./dashboard.view'))

module.exports = MainDashBoardRouter