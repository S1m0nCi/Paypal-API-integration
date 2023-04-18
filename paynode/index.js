const express = require('express')
const paypal = require('paypal-rest-sdk')

paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': '',
    'client_secret': ''
});

const app = express()

app.get('/', (req, res) => res.sendFile(__dirname + 'index.html'))
app.listen(PORT, () => console.log(`Server started on ${PORT}`))

app.post('/pay', (req, res) => {
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal'
        },
        'redirect_urls': {
            'return_url': '',
            'cancel_url': ''
        },
        'transactions': [{
            'item_list': {
                'items': [{
                    //item details: name, sku, price, currency, quantity
                }]
            },
            'amount': {
                'currency': '',
                'total': ''
            },
            'description': ''
        }]
    };
    app.get('/success', (req, res) => {
        const payerId = req.query.PayerID // check spelling and cases
        const paymentId = req.query.paymentId

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                'amount': {
                    'currency': '',
                    'total': ''
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
            if (error) {
                console.log(error.response)
                throw error
            } else {
                console.log(JSON.stringify(payment))
                res.send('Success')
            }
        })

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                throw error
            } else {
                for (let i =0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href)
                    }
                }
            }
        })
        app.get('/cancel', (req, res) => res.send('Cancelled'))
    })
})

