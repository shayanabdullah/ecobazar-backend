import { Request, Response } from 'express';


const userController = async (req: Request, res: Response) => {

res.send('hello user')
}


export default userController;
