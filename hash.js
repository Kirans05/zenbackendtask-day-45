const bcryptjs = require("bcryptjs")
const saltRound = 10


const hashPassword = async (pwd) => {
    let salt = await bcryptjs.genSalt(saltRound)
    let hash = await bcryptjs.hash(pwd,salt)
    return hash
}

const comparePassword = async (pwd,hash) =>{
    let compareResult = await bcryptjs.compare(pwd,hash)
    return compareResult
}

module.exports = {hashPassword,comparePassword}