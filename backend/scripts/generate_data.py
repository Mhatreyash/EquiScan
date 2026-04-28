import pandas as pd
import numpy as np
import random

print("🧬 Initializing Data Generator...")

# Set seed so the data looks realistic but is consistent
np.random.seed(42)
num_applicants = 1000

# Create realistic distribution (60% Male, 40% Female in this tech scenario)
genders = ['Male'] * 600 + ['Female'] * 400
random.shuffle(genders)

# The base applicant pool (Everyone has the same baseline stats)
base_data = {
    'Applicant_ID': range(1, num_applicants + 1),
    'Gender': genders,
    'Years_Experience': np.random.randint(1, 15, num_applicants),
    'Interview_Score': np.random.randint(40, 100, num_applicants),
}
df_base = pd.DataFrame(base_data)

# ==========================================
# SCENARIO 1: Severe Anti-Female Bias
# ==========================================
def logic_anti_female(row):
    # Men need a 55+ score. Women need an 85+ score.
    if row['Gender'] == 'Male':
        return row['Interview_Score'] > 55
    else:
        return row['Interview_Score'] > 85

df1 = df_base.copy()
df1['AI_Hired'] = df1.apply(logic_anti_female, axis=1)
df1.to_csv('test_1_anti_female_bias.csv', index=False)
print("✅ Created: test_1_anti_female_bias.csv")

# ==========================================
# SCENARIO 2: Severe Anti-Male Bias
# ==========================================
def logic_anti_male(row):
    # Women need a 55+ score. Men need an 85+ score.
    if row['Gender'] == 'Female':
        return row['Interview_Score'] > 55
    else:
        return row['Interview_Score'] > 85

df2 = df_base.copy()
df2['AI_Hired'] = df2.apply(logic_anti_male, axis=1)
df2.to_csv('test_2_anti_male_bias.csv', index=False)
print("✅ Created: test_2_anti_male_bias.csv")

# ==========================================
# SCENARIO 3: Perfectly Fair (Merit Only)
# ==========================================
def logic_fair(row):
    # AI looks strictly at a combination of experience and score. Gender is ignored.
    merit_score = row['Interview_Score'] + (row['Years_Experience'] * 2)
    return merit_score > 90

df3 = df_base.copy()
df3['AI_Hired'] = df3.apply(logic_fair, axis=1)
df3.to_csv('test_3_perfectly_fair.csv', index=False)
print("✅ Created: test_3_perfectly_fair.csv")

# ==========================================
# SCENARIO 4: Borderline / Sneaky Bias
# ==========================================
def logic_borderline(row):
    # Men need a 70. Women need a 75. 
    # It's biased, but might squeeze past the 80% legal rule.
    if row['Gender'] == 'Male':
        return row['Interview_Score'] > 70
    else:
        return row['Interview_Score'] > 75

df4 = df_base.copy()
df4['AI_Hired'] = df4.apply(logic_borderline, axis=1)
df4.to_csv('test_4_borderline.csv', index=False)
print("✅ Created: test_4_borderline.csv")

print("\n🎉 All 4 test datasets generated successfully! Go test them in the UI.")