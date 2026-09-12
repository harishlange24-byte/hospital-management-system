export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout({ key, order, onSuccess }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) throw new Error('Failed to load Razorpay')

  return new Promise((resolve, reject) => {
    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: 'MediCare HMS',
      description: 'Payment',
      handler: (response) => {
        onSuccess(response)
        resolve(response)
      },
      theme: { color: '#2563eb' },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  })
}
