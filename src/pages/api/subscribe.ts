import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb'
import { stripe } from "../../services/stripe";


type User = {
    ref:{
        id:string
    },
    data:{
        stripe_custumer_id:string
    }
}

export default async(req:NextApiRequest,res:NextApiResponse)=>{
    if(req.method === "POST"){

        const session = await getSession({
            req
        })

        const {email,image,name} = session.user

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index("user_by_email"),
                    q.Casefold(email)
                )
            )
        )

        let custumerId = user.data.stripe_custumer_id

        if(!custumerId){
            
            const stripeCustumer = await stripe.customers.create({
                email,
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'),user.ref.id),{
                        data:{
                            stripe_custumer_id:stripeCustumer.id
                        }
                    }
                )
            )

            custumerId = stripeCustumer.id
        }


        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer:custumerId,
            payment_method_types:['card'],
            billing_address_collection: 'required',
            line_items:[
                {
                    price:'price_1IgZqeJyrdH8LVJtwjLAGtP7',
                    quantity:1,
                }
            ],
            mode:'subscription',
            allow_promotion_codes:true,
            success_url:"http://localhost:3000/posts",
            cancel_url:"http://localhost:3000"
        })

        return res.status(200).json({
            sessionId:stripeCheckoutSession.id
        })
    
    }else{
        res.setHeader("Allow","POST")
        res.status(405).end("Method not Allowed")
    }
}