let students = [];

export default function handler(req, res) {

    if (req.method === "POST") {

        const { action, data } = req.body;

        if (action === "addStudent") {
            const student = {
                id: "SEH" + Math.floor(1000 + Math.random() * 9000),
                ...data
            };

            students.push(student);
            return res.status(200).json(student);
        }

        if (action === "login") {
            const { id, password } = data;

            const student = students.find(
                s => s.id === id && s.password === password
            );

            if (student) {
                return res.json({ success: true, student });
            } else {
                return res.json({ success: false });
            }
        }
    }

    res.status(405).send("Method Not Allowed");
}
