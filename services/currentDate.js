function currentDate() {
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    const finalFormat = formattedDate[6]+formattedDate[7]+formattedDate[8]+formattedDate[9]+"-"+formattedDate[3]+formattedDate[4]+"-"+formattedDate[0]+formattedDate[1];
    return finalFormat;
}

module.exports = { currentDate: currentDate };