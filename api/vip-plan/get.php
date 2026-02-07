<?php
/**
 * API: Get VIP Plan Data
 * Returns hardcoded VIP plan pricing and payment information
 * This data is not stored in the database - it's maintained here as JSON
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = [
    "languages" => [
        [
            "id" => "english",
            "name" => "English Language",
            "icon" => "🇬🇧",
            "courses" => [
                [
                    "name" => "Basic Course",
                    "price" => 10000,
                    "priceLabel" => "10,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Elementary Course",
                    "price" => 10000,
                    "priceLabel" => "10,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Elementary Translation Course",
                    "price" => 10000,
                    "priceLabel" => "10,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Essential Speaking Course",
                    "price" => 15000,
                    "priceLabel" => "15,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Listening Course",
                    "price" => 0,
                    "priceLabel" => "မေတ္တာလက်ဆောင်",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => true
                ]
            ],
            "bundlePlans" => [
                [
                    "name" => "Diamond Plan",
                    "price" => 30000,
                    "priceLabel" => "30,000 kyats",
                    "blueMark" => true,
                    "remark" => "Basic to Intermediate (All courses)",
                    "tier" => "diamond",
                    "color" => "#b9f2ff",
                    "savings" => "Save up to 25,000 kyats"
                ]
            ]
        ],
        [
            "id" => "korea",
            "name" => "Korean Language",
            "icon" => "🇰🇷",
            "courses" => [
                [
                    "name" => "Basic Course",
                    "price" => 10000,
                    "priceLabel" => "10,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 1 Course",
                    "price" => 15000,
                    "priceLabel" => "15,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 2 Course",
                    "price" => 15000,
                    "priceLabel" => "15,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 3-1 Course",
                    "price" => 20000,
                    "priceLabel" => "20,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 3-2 Course",
                    "price" => 20000,
                    "priceLabel" => "20,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 4-1 Course",
                    "price" => 20000,
                    "priceLabel" => "20,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Level 4-2 Course",
                    "price" => 20000,
                    "priceLabel" => "20,000 kyats",
                    "blueMark" => true,
                    "remark" => "",
                    "isFree" => false
                ],
                [
                    "name" => "Topik I Class",
                    "price" => 25000,
                    "priceLabel" => "25,000 kyats",
                    "blueMark" => true,
                    "remark" => "On going",
                    "isFree" => false
                ],
                [
                    "name" => "Basic Vocabulary Course",
                    "price" => 0,
                    "priceLabel" => "မေတ္တာလက်ဆောင်",
                    "blueMark" => false,
                    "remark" => "",
                    "isFree" => true
                ]
            ],
            "bundlePlans" => [
                [
                    "name" => "Silver Plan",
                    "price" => 30000,
                    "priceLabel" => "30,000 kyats",
                    "blueMark" => true,
                    "remark" => "Basic to Level 3-2",
                    "tier" => "silver",
                    "color" => "#c0c0c0",
                    "savings" => "Save up to 50,000 kyats"
                ],
                [
                    "name" => "Gold Plan",
                    "price" => 40000,
                    "priceLabel" => "40,000 kyats",
                    "blueMark" => true,
                    "remark" => "Basic to Level 4-2",
                    "tier" => "gold",
                    "color" => "#ffd700",
                    "savings" => "Save up to 80,000 kyats"
                ],
                [
                    "name" => "Diamond Plan",
                    "price" => 50000,
                    "priceLabel" => "50,000 kyats",
                    "blueMark" => true,
                    "remark" => "Basic to Level 4-2 and Topik I Class",
                    "tier" => "diamond",
                    "color" => "#b9f2ff",
                    "savings" => "Save up to 115,000 kyats"
                ]
            ]
        ]
    ],
    "blueMarkInfo" => [
        "title" => "Blue Mark",
        "description" => "Calamus Education ရဲ့ Mobile App/ website တွေထဲမှ Additional Lessons နှင့် Feature အားလုံးကို သက်ဆိုင်ရာ Language အလိုက် ဝင်ရောက်အသုံးပြုနိုင်ခွင့်ရရှိမှာဖြစ်ပါတယ်"
    ],
    "diamondPlanInfo" => [
        "title" => "Diamond Plan",
        "description" => "Calamus Education မှ ဖွင့်လစ်သော သက်ဆိုင်ရာသင်တန်းများ အားလုံးကို ဝင်ရောက် လေ့လာခွင့်ရရှိမှာဖြစ်ပါတယ်...",
        "example" => "ဥပမာ Easy Korean ရဲ့ Diamond plan package ကိုဝယ်ယူထားပါက Easy Korean မှ ဖွင့်လစ်သော ကိုရီးယားဘာသာစကား သင်တန်းအားလုံးကို ဝင်ရောက် လေ့လာနိုင်မှာဖြစ်ပါတယ်။"
    ],
    "paymentMethods" => [
        [
            "name" => "KBZPay",
            "icon" => "kbzpay",
            "phone" => "09688683805",
            "accountName" => "Min Htet Kyaw"
        ],
        [
            "name" => "Mytel Pay",
            "icon" => "mytelpay",
            "phone" => "09688683805",
            "accountName" => "Min Htet Kyaw"
        ],
        [
            "name" => "Wave Pay",
            "icon" => "wavepay",
            "phone" => "09688683805",
            "accountName" => "Min Htet Kyaw"
        ]
    ],
    "paymentInstructions" => [
        "title" => "ကျသင့်ငွေပေးချေပြီးပါက",
        "description" => "ကျသင့်ငွေအားပေးချေပြီးပါက ငွေပေးချေထားသည့်ဖြတ်ပိုင်း Screenshot အား ADMIN TEAM သို့ ဆက်သွယ် ပေးပို့ရမှာပဲဖြစ်ပါတယ်"
    ]
];

echo json_encode([
    "success" => true,
    "data" => $data
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
