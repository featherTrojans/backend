const codeGenerator = (length) => {
    
    const chars = "0123456789"
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


module.exports = codeGenerator;