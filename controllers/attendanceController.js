import attendanceService from '../services/attendanceService.js';

class AttendanceController {

    async create(req, res) {
        try {
            const result = await attendanceService.registerAttendance(req.body);

            res.status(201).json({ 
                message: "Asistencia creada correctamente", 
                attendance: result 
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        console.log("getAll");
        console.log(req.params);
        console.log(req.query);
        try {
            const result = await attendanceService.getAttendance(req.query);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getByClassAndDate(req, res) {
        console.log("getByClassAndDate");
        console.log(req.params);
        console.log(req.query);
        try {
            const { class_id, date } = req.query;
            if (!class_id || !date) {
                return res.status(400).json({ message: "class_id and date are required" });
            }
            const result = await attendanceService.getAttendanceByClassAndDate(class_id, date);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const result = await attendanceService.updateAttendance(id, req.body);
            res.status(200).json({ 
                message: "Asistencia actualizada correctamente", 
                attendance: result 
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await attendanceService.deleteAttendance(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AttendanceController();
