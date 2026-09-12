import { Request, Response } from 'express';


const vendorController = async (req: Request, res: Response) => {

res.send('hello vendor')
}


export default vendorController;        
