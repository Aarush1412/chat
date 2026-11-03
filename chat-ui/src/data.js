export const currentUser = {
  id: 1,
  name: "You",
  //avatar: "https://i.pravatar.cc/150?img=11"
};

export const users = [
  { id: 2, name: "Sarah Connor", avatar: "https://i.pravatar.cc/150?img=5", lastMessage: "Are we still on for dinner?", time: "9:41 AM", online: true },
  { id: 3, name: "Mike Ross", avatar: "https://i.pravatar.cc/150?img=3", lastMessage: "Send me the files when you can", time: "8:20 PM", online: false },
  { id: 4, name: "Elena Fisher", avatar: "https://i.pravatar.cc/150?img=22", lastMessage: "😂😂 that's hilarious", time: "Yesterday", online: true },
  { id: 5, name: "Alex Morgan", avatar: "https://i.pravatar.cc/150?img=44", lastMessage: "Meeting at 3 PM?", time: "Yesterday", online: false },
  { id: 6, name: "Jessica Jones", avatar: "https://i.pravatar.cc/150?img=18", lastMessage: "Did you see the email?", time: "Monday", online: true },
];

export const messages = {
  2: [
    { id: 1, text: "Hey! How's it going?", senderId: 2, time: "9:30 AM", status: "read" },
    { id: 2, text: "Good, thanks! You?", senderId: 1, time: "9:35 AM", status: "read" },
    { id: 3, text: "Are we still on for dinner?", senderId: 2, time: "9:41 AM", status: "sent" },
  ],
  3: [
    { id: 4, text: "Send me the files when you can", senderId: 3, time: "8:20 PM", status: "read" },
    { id: 5, text: "Sure, I'll email them now.", senderId: 1, time: "8:25 PM", status: "read" },
  ],
  4: [],
  5: [],
  6: [],
};
