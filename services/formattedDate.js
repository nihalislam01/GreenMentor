function formattedDate(date) {
    const formattedDate = date.toLocaleDateString();
    const calender = [0,"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const finalFormat = formattedDate[0]+formattedDate[1]+" "+calender[parseInt(formattedDate[3]+formattedDate[4])]+" "+formattedDate[6]+formattedDate[7]+formattedDate[8]+formattedDate[9];
    return finalFormat;
}

module.exports = { formattedDate: formattedDate };