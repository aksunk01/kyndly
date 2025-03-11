import pandas as pd

def get_data(info, money):
    csv = info
    file  = money

    latest = pd.read_csv(csv)
    sch_a = pd.read_csv(file)

    #Columns needed
    ack_id = "ACK_ID"
    name = 'SPONSOR_DFE_NAME'
    code = 'BUSINESS_CODE'
    provider = 'INS_CARRIER_NAME'
    plan_name = 'PLAN_NAME'
    city = 'SPONS_DFE_MAIL_US_CITY'
    state = 'SPONS_DFE_MAIL_US_STATE'
    size = 'TOT_ACTIVE_PARTCP_CNT'
    provider = "INS_CARRIER_NAME"
    amount = "PENSION_PREM_PAID_TOT_AMT"

    #Columns that I want to keep
    columns_csv = [ack_id, name, city, state, code, plan_name, size]
    columns_file = [ack_id, provider, amount]

    com = latest.loc[:, columns_csv]
    sch_A = sch_a.loc[:, columns_file] 

    combined =  pd.merge(com,sch_A, on = ack_id, how='left')
    
    combined_clean = combined.dropna(subset=[amount])

    

    return(combined_clean)







