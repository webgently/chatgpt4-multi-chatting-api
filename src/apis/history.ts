import { Request, Response } from 'express';
import Nexus from '../controllers/nexus';

const removeHistory = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        var result = await Nexus.remove({ });
        if (result) {
            res.send({ status: true });
        }
    } catch (error) {
        res.status(500).json({ status: false });
    }
}

export default { removeHistory };