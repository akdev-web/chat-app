function formatDateLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }); // e.g., "21 July 2025"
}


function InsertDateBreakpoints(messages) {
  const result = [];
  let lastDate = null;

  if(messages.length === 0){
    result.push({
      id: `no-data`,
      type: 'system',
      text: "No Messages Yet !", 
    });
  }

  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp);
    const dateKey = msgDate.toDateString(); // "Sun Jul 20 2025"

    if (dateKey !== lastDate) {
      // Add system message
      result.push({
        id: `date-${dateKey}`,
        type: 'system',
        text: formatDateLabel(msgDate), // e.g., "Today", "Yesterday", or "July 20, 2025"
      });
      lastDate = dateKey;
    }

    if(msg.sender!=='system')
      result.push({ ...msg, type: 'user' }); // Keep the original message
    else result.push({...msg,type:'system'})
  });

   return result;
}

export default InsertDateBreakpoints;