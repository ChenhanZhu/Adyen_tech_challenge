import Adyen
import json
from main.config import adyen_api_key, adyen_merchant_account

adyen = Adyen.Adyen()
adyen.payment.client.xapikey = adyen_api_key
adyen.payment.client.platform = "test"  # change to live for production
adyen.payment.client.merchant_account = adyen_merchant_account

def create_sessions(host_url):
    json_request = {
      "merchantAccount": adyen_merchant_account,
      "amount": {
        "value": 1000,
        "currency": "EUR"
      },
      "returnUrl": f"{host_url}/redirect?shopperOrder=myRef",
      "reference": "chenhan_checkoutChallenge",
      "countryCode": "NL"
    }

    result = adyen.checkout.payments_api.sessions(json_request)

    formatted_response = json.dumps((json.loads(result.raw_response)))
    print("/sessions response:\n" + formatted_response)

    return formatted_response
