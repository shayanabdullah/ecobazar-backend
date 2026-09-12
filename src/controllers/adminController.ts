import { Request, Response } from 'express';


const adminController = async (req: Request, res: Response) => {

res.send('hello admin')
}


export default adminController;
