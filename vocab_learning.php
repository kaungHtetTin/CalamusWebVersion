<?php 
    session_start();
  
    include('classes/connect.php');
    include ('classes/auth.php');
    include('classes/app.php');


    $page_title="Vocab Learning";
 

    $Auth=new Auth();
    $user = false;
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }

    $App=new App();
    $app=$App->getRand();

    include('layouts/header.php');
?>


<style>
/* Flashcard Styles */
.flashcard-container {
    position: relative;
    min-height: 550px;
}

.flashcard-wrapper {
    perspective: 1000px;
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.flashcard {
    position: relative;
    width: 100%;
    height: 550px;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
}

.flashcard.flipped {
    transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    padding: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
}

.flashcard-front:hover,
.flashcard-back:hover {
    box-shadow: 0 12px 32px rgba(237, 42, 38, 0.15);
}

.flashcard-back {
    transform: rotateY(180deg);
}

.card-content {
    width: 100%;
    text-align: center;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.word-display {
    margin-bottom: 20px;
    animation: slideInDown 0.6s ease-out;
    flex-shrink: 0;
}


@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-word {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    animation: fadeIn 0.8s ease-out;
    line-height: 1.2;
    flex: 1;
}


@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Language and Deck Selector Styles */
.right_side {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(237, 42, 38, 0.1);
    transition: all 0.3s ease;
    animation: slideInRight 0.6s ease-out;
    position: sticky;
    top: 20px;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.right_side:hover {
    box-shadow: 0 8px 30px rgba(237, 42, 38, 0.15);
    transform: translateY(-2px);
}

.right_side h4 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 3px solid #ed2a26;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
}

.right_side h4::before {
    content: '📚';
    font-size: 1.8rem;
}

.selection-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.selector-group {
    position: relative;
}

.selector-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.selector-group label i {
    color: #ed2a26;
    font-size: 1.1rem;
}

.selector-group select {
    width: 100%;
    padding: 12px 40px 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    background-color: #ffffff !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ed2a26' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 12px;
    color: #2c3e50 !important;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    line-height: 1.5;
    min-height: 48px;
    display: block;
}

.selector-group select:hover {
    border-color: #ed2a26;
    box-shadow: 0 2px 8px rgba(237, 42, 38, 0.1);
}

.selector-group select:focus {
    outline: none;
    border-color: #ed2a26;
    box-shadow: 0 0 0 3px rgba(237, 42, 38, 0.1);
}

.selector-group select:disabled {
    background-color: #f5f5f5 !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2395a5a6' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    cursor: not-allowed;
    opacity: 0.7;
    border-color: #d0d0d0;
    color: #7f8c8d !important;
}

.selector-group select option {
    padding: 10px 15px;
    font-weight: 500;
    color: #2c3e50;
    background-color: #ffffff;
}

.selector-group select option:checked {
    background-color: #ed2a26;
    color: #ffffff;
    font-weight: 600;
}

.selector-group select option:hover {
    background-color: #f8f9fa;
}

#btn-start-learning {
    background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%);
    border: none;
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(237, 42, 38, 0.3);
    position: relative;
    overflow: hidden;
    margin-top: 10px;
}

#btn-start-learning::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
}

#btn-start-learning:hover::before {
    left: 100%;
}

#btn-start-learning:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(237, 42, 38, 0.4);
    background: linear-gradient(135deg, #c9221f 0%, #a51c19 100%);
}

#btn-start-learning:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(237, 42, 38, 0.3);
}

#btn-start-learning:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
}

#btn-start-learning:disabled::before {
    display: none;
}

/* Selector status indicator */
.selector-status {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 8px;
    background: #95a5a6;
    transition: all 0.3s ease;
    vertical-align: middle;
}

/* Skip Confirmation Dialog */
.skip-confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.skip-dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
}

.skip-dialog-content {
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 450px;
    width: 90%;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    border: 2px solid rgba(237, 42, 38, 0.2);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.skip-dialog-header {
    padding: 25px 25px 15px;
    text-align: center;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.skip-dialog-header i {
    font-size: 3rem;
    color: #ed2a26;
    display: block;
    margin-bottom: 10px;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.skip-dialog-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
}

.skip-dialog-body {
    padding: 25px;
    text-align: center;
}

.skip-dialog-body p {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #555;
    font-weight: 500;
}

.skip-dialog-footer {
    padding: 20px 25px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    border-top: 2px solid #e9ecef;
    background: #f8f9fa;
}

.skip-dialog-btn {
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 100px;
}

.skip-dialog-cancel {
    background: #e9ecef;
    color: #495057;
}

.skip-dialog-cancel:hover {
    background: #dee2e6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.skip-dialog-ok {
    background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(237, 42, 38, 0.3);
}

.skip-dialog-ok:hover {
    background: linear-gradient(135deg, #c9221f 0%, #a51c19 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(237, 42, 38, 0.4);
}

.skip-dialog-ok:active,
.skip-dialog-cancel:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .skip-dialog-content {
        max-width: 90%;
        margin: 20px;
    }
    
    .skip-dialog-header h3 {
        font-size: 1.3rem;
    }
    
    .skip-dialog-body p {
        font-size: 1rem;
    }
    
    .skip-dialog-footer {
        flex-direction: column-reverse;
    }
    
    .skip-dialog-btn {
        width: 100%;
    }
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
    .right_side {
        margin-bottom: 20px;
        position: relative;
        top: 0;
        padding: 20px;
    }
    
    .right_side h4 {
        font-size: 1.3rem;
        margin-bottom: 20px;
    }
    
    .flashcard_section {
        margin-top: 0;
    }
    
    .selector-group select {
        padding: 10px 35px 10px 12px;
        font-size: 0.95rem;
        min-height: 44px;
    }
    
    #btn-start-learning {
        padding: 12px 18px;
        font-size: 1rem;
    }
}

.card-ipa {
    font-size: 1rem;
    color: #7f8c8d;
    font-style: italic;
    animation: fadeIn 1s ease-out;
}

.answer-section {
    margin-bottom: 20px;
    text-align: left;
    animation: slideInUp 0.6s ease-out 0.2s backwards;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-translation {
    font-size: 1.1rem;
    color: #2c3e50;
    margin-bottom: 15px;
    font-weight: 600;
    padding: 10px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    border-left: 4px solid #ed2a26;
    line-height: 1.4;
}

.card-examples {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.6;
    max-height: 150px;
    overflow-y: auto;
    padding-right: 5px;
}

/* Custom scrollbar for examples */
.card-examples::-webkit-scrollbar {
    width: 6px;
}

.card-examples::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.card-examples::-webkit-scrollbar-thumb {
    background: #ed2a26;
    border-radius: 10px;
}

.card-examples::-webkit-scrollbar-thumb:hover {
    background: #c9221f;
}

/* Custom scrollbar for answer section */
.answer-section::-webkit-scrollbar {
    width: 6px;
}

.answer-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.answer-section::-webkit-scrollbar-thumb {
    background: #ed2a26;
    border-radius: 10px;
}

.answer-section::-webkit-scrollbar-thumb:hover {
    background: #c9221f;
}

.card-examples .example {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-left: 3px solid #ed2a26;
    background: rgba(237, 42, 38, 0.05);
    border-radius: 4px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.card-examples .example:hover {
    background: rgba(237, 42, 38, 0.1);
    transform: translateX(5px);
}

.btn-show-answer,
.btn-skip {
    padding: 14px 35px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-show-answer::before,
.btn-skip::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.btn-show-answer:hover::before,
.btn-skip:hover::before {
    width: 300px;
    height: 300px;
}

.btn-show-answer {
    background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%);
    color: white;
    animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
    0%, 100% {
        box-shadow: 0 4px 12px rgba(237, 42, 38, 0.4);
    }
    50% {
        box-shadow: 0 4px 20px rgba(237, 42, 38, 0.6);
    }
}

.btn-show-answer:hover {
    background: linear-gradient(135deg, #c9221f 0%, #a51c19 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(237, 42, 38, 0.5);
}

.btn-show-answer:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 42, 38, 0.4);
}

.btn-skip {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    margin-top: 15px;
}

.btn-skip:hover {
    background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(231, 76, 60, 0.5);
}

.btn-skip:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.rating-section {
    margin-top: 15px;
    flex-shrink: 0;
}

.rating-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 12px;
}

.rating-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.rating-btn {
    width: 55px;
    height: 55px;
    border: 3px solid #e0e0e0;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    font-size: 1.3rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: #333;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: fadeInScale 0.5s ease-out backwards;
}

.rating-btn:nth-child(1) { animation-delay: 0.1s; }
.rating-btn:nth-child(2) { animation-delay: 0.2s; }
.rating-btn:nth-child(3) { animation-delay: 0.3s; }
.rating-btn:nth-child(4) { animation-delay: 0.4s; }
.rating-btn:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.5);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.rating-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(237, 42, 38, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.4s, height 0.4s;
}

.rating-btn:hover {
    background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%);
    color: white;
    border-color: #ed2a26;
    transform: scale(1.15) translateY(-5px);
    box-shadow: 0 8px 20px rgba(237, 42, 38, 0.4);
}

.rating-btn:hover::before {
    width: 100px;
    height: 100px;
}

.rating-btn:active {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 4px 12px rgba(237, 42, 38, 0.3);
}

.rating-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    background: #f5f5f5;
    border-color: #ddd;
    box-shadow: none;
}

.rating-btn:disabled:hover {
    transform: none;
    box-shadow: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    z-index: 10;
    animation: fadeIn 0.3s ease-out;
}

.loading-overlay p {
    margin-top: 15px;
    color: #ed2a26;
    font-weight: 600;
    font-size: 1rem;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

.spinner {
    border: 4px solid rgba(237, 42, 38, 0.1);
    border-top: 4px solid #ed2a26;
    border-right: 4px solid #ed2a26;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 0.8s linear infinite;
    margin-bottom: 10px;
    box-shadow: 0 0 20px rgba(237, 42, 38, 0.3);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Skeleton Loader */
.skeleton-loader {
    padding: 30px;
}

.skeleton-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.skeleton-line,
.skeleton-button {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s ease-in-out infinite;
    border-radius: 4px;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.flashcard-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    animation: slideInDown 0.5s ease-out;
    border: 1px solid rgba(237, 42, 38, 0.1);
}

.card-progress {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
}

.learning-stats {
    font-size: 0.95rem;
    color: #555;
}

.learning-day {
    font-weight: 600;
    color: #ed2a26;
    text-shadow: 0 1px 2px rgba(237, 42, 38, 0.2);
}

/* Card transition animations */
.flashcard-wrapper {
    animation: cardAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardAppear {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Rating section animation */
.rating-section {
    animation: ratingFadeIn 0.6s ease-out 0.3s backwards;
}

@keyframes ratingFadeIn {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Completed State Animations */
.completed-state {
    animation: celebrationEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.completed-state::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(237, 42, 38, 0.1) 0%, transparent 70%);
    animation: celebrationGlow 2s ease-in-out infinite;
}

@keyframes celebrationEntrance {
    0% {
        opacity: 0;
        transform: scale(0.5) rotate(-10deg);
    }
    50% {
        transform: scale(1.1) rotate(5deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
}

@keyframes celebrationGlow {
    0%, 100% {
        transform: rotate(0deg) scale(1);
        opacity: 0.3;
    }
    50% {
        transform: rotate(180deg) scale(1.2);
        opacity: 0.6;
    }
}

.completed-state h4 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ed2a26;
    margin-bottom: 20px;
    animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s backwards;
    text-shadow: 0 4px 12px rgba(237, 42, 38, 0.3);
    position: relative;
    z-index: 1;
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3) translateY(-100px);
    }
    50% {
        transform: scale(1.1) translateY(10px);
    }
    70% {
        transform: scale(0.95) translateY(-5px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.completed-state h4::after {
    content: '✨';
    display: inline-block;
    margin-left: 10px;
    animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
    0%, 100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
    25% {
        transform: scale(1.3) rotate(90deg);
        opacity: 0.8;
    }
    50% {
        transform: scale(1) rotate(180deg);
        opacity: 1;
    }
    75% {
        transform: scale(1.3) rotate(270deg);
        opacity: 0.8;
    }
}

.completed-state p {
    font-size: 1.3rem;
    color: #555;
    margin-bottom: 30px;
    animation: slideInUp 0.8s ease-out 0.5s backwards;
    position: relative;
    z-index: 1;
    font-weight: 500;
}

.completed-state .btn {
    padding: 14px 40px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(237, 42, 38, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: buttonPulse 2s ease-in-out infinite 0.8s;
    position: relative;
    z-index: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
}

@keyframes buttonPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 6px 20px rgba(237, 42, 38, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 8px 30px rgba(237, 42, 38, 0.6);
    }
}

.completed-state .btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 35px rgba(237, 42, 38, 0.5);
    background: linear-gradient(135deg, #c9221f 0%, #a51c19 100%);
}

.completed-state .btn:active {
    transform: translateY(-1px) scale(1.02);
}

/* Confetti particles effect */
.completed-state::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(circle at 20% 30%, rgba(237, 42, 38, 0.3) 2px, transparent 2px),
        radial-gradient(circle at 60% 70%, rgba(231, 76, 60, 0.3) 2px, transparent 2px),
        radial-gradient(circle at 80% 20%, rgba(46, 204, 113, 0.3) 2px, transparent 2px),
        radial-gradient(circle at 40% 80%, rgba(241, 196, 15, 0.3) 2px, transparent 2px),
        radial-gradient(circle at 90% 60%, rgba(155, 89, 182, 0.3) 2px, transparent 2px);
    background-size: 200% 200%;
    animation: confettiFloat 3s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
}

@keyframes confettiFloat {
    0%, 100% {
        background-position: 0% 0%, 100% 100%, 50% 50%, 25% 75%, 75% 25%;
    }
    50% {
        background-position: 100% 100%, 0% 0%, 50% 50%, 75% 25%, 25% 75%;
    }
}
</style>
	<!-- Body Start -->
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">
            <!-- Alert Message -->
            <div class="alert alert-info alert-dismissible fade show" role="alert" style="margin-top: 20px; margin-bottom: 20px; border-left: 4px solid #ed2a26;">
                <i class="uil uil-info-circle" style="margin-right: 8px;"></i>
                <strong>Notice:</strong> မိမိအမှန်တကယ်ကျွမ်းကျင်ပိုင်နိုင်ပြီးသော စကားလုံးများကို 'skip' ပြုလုပ်ခြင်းဖြင့် လေ့လာမှုအပိုင်းတွင် ပိုမိုထိရောက်ကောင်းမွန်မည်ဖြစ်ပါသည်။
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="row">
                <!-- Deck Selection - Moved to top on mobile -->
                <div class="col-xl-3 col-lg-4 col-md-12 order-1 order-md-2 order-xl-1">
                    <div class="right_side">
                        <h4>Select Language and Deck</h4>
                        <?php if($user){ ?>
                            <div class="selection-section">
                                <div class="selector-group">
                                    <label for="language-select">
                                        <i class="uil uil-globe"></i>
                                        Language
                                        <span class="selector-status"></span>
                                    </label>
                                    <select class="form-control" id="language-select">
                                        <option value="">-- Select Language --</option>
                                    </select>
                                </div>
                                <div class="selector-group">
                                    <label for="deck-select">
                                        <i class="uil uil-book-open"></i>
                                        Deck
                                        <span class="selector-status"></span>
                                    </label>
                                    <select class="form-control" id="deck-select" disabled>
                                        <option value="">-- Select Deck --</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary btn-block" id="btn-start-learning" disabled>
                                    <i class="uil uil-play-circle"></i> Start Learning
                                </button>
                            </div>
                        <?php } else { ?>
                            <div class="text-center" style="padding: 20px;">
                                <p style="color: #7f8c8d; margin-bottom: 15px;">Please login to start learning.</p>
                                <a href="login.php" class="btn" style="background: linear-gradient(135deg, #ed2a26 0%, #c9221f 100%); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block; transition: all 0.3s ease;">
                                    <i class="uil uil-signin"></i> Login
                                </a>
                            </div>
                        <?php }?>

                    </div>
                </div>
                
                <div class="col-xl-9 col-lg-8 col-md-12 order-2 order-md-1 order-xl-2">
                   <div class="flashcard_section">
                    <!-- Progress and Stats -->
                    <div class="flashcard-header mb-4" style="display: none;">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="progress-info">
                                    <span class="card-progress">Card <span id="current-card-num">0</span> of <span id="total-cards">0</span></span>
                                </div>
                            </div>
                            <div class="col-md-6 text-right">
                                <div class="learning-stats">
                                    <span class="learning-day">Learning Day: <span id="learning-day-num">-</span></span>
                                    <span class="ml-3">New: <span id="new-words-count">0</span> | Review: <span id="recall-words-count">0</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Flashcard Container -->
                    <div class="flashcard-container" style="max-width: 600px; margin: 0 auto;">
                        <!-- Skeleton Loader -->
                        <div id="skeleton-loader" class="skeleton-loader" style="display: none;">
                            <div class="skeleton-card">
                                <div class="skeleton-line" style="height: 40px; width: 60%; margin-bottom: 20px;"></div>
                                <div class="skeleton-line" style="height: 30px; width: 80%; margin-bottom: 15px;"></div>
                                <div class="skeleton-line" style="height: 30px; width: 70%;"></div>
                                <div class="skeleton-button" style="height: 50px; width: 200px; margin-top: 30px;"></div>
                            </div>
                        </div>

                        <!-- Skip Confirmation Dialog -->
                        <div id="skip-confirmation-dialog" class="skip-confirmation-dialog" style="display: none;">
                            <div class="skip-dialog-overlay"></div>
                            <div class="skip-dialog-content">
                                <div class="skip-dialog-header">
                                    <i class="uil uil-exclamation-triangle"></i>
                                    <h3>Confirm Skip Word</h3>
                                </div>
                                <div class="skip-dialog-body">
                                    <p>The skipping word will be permanently removed from the learning process and make sure you know this word well. Do you really want to skip?</p>
                                </div>
                                <div class="skip-dialog-footer">
                                    <button class="skip-dialog-btn skip-dialog-cancel" id="skip-dialog-cancel">Cancel</button>
                                    <button class="skip-dialog-btn skip-dialog-ok" id="skip-dialog-ok">OK</button>
                                </div>
                            </div>
                        </div>

                        <!-- Flashcard -->
                        <div id="flashcard-wrapper" class="flashcard-wrapper" style="display: none;">
                            <div class="flashcard" id="flashcard">
                                <!-- Front Side -->
                                <div class="flashcard-front" id="flashcard-front">
                                    <div class="card-content">
                                        <div class="word-display">
                                            <h2 id="card-word" class="card-word"></h2>
                                            <div id="card-ipa" class="card-ipa"></div>
                                        </div>
                                        <button class="btn-show-answer" id="btn-show-answer">Show Answer</button>
                                    </div>
                                </div>

                                <!-- Back Side -->
                                <div class="flashcard-back" id="flashcard-back" style="display: none;">
                                    <div class="card-content">
                                        <div class="word-display">
                                            <h2 id="back-card-word" class="card-word"></h2>
                                            <div id="back-card-ipa" class="card-ipa"></div>
                                        </div>
                                        <div class="answer-section">
                                            <div id="card-translation" class="card-translation"></div>
                                            <div id="card-examples" class="card-examples"></div>
                                        </div>
                                        <div class="rating-section">
                                            <p class="rating-label">How well did you know this?</p>
                                            <div class="rating-buttons">
                                                <button class="rating-btn" data-rating="1" title="Complete blackout">1</button>
                                                <button class="rating-btn" data-rating="2" title="Incorrect response">2</button>
                                                <button class="rating-btn" data-rating="3" title="Correct response with difficulty">3</button>
                                                <button class="rating-btn" data-rating="4" title="Correct response after hesitation">4</button>
                                                <button class="rating-btn" data-rating="5" title="Perfect response">5</button>
                                            </div>
                                            <button class="btn-skip" id="btn-skip">Skip Word</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Loading Overlay -->
                                <div class="loading-overlay" id="loading-overlay" style="display: none;">
                                    <div class="spinner"></div>
                                    <p>...</p>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div id="empty-state" class="empty-state" style="display: none; text-align: center; padding: 40px;">
                            <h4>No cards available</h4>
                            <p>Please select a language and deck to start learning.</p>
                        </div>

                        <!-- Completed State -->
                        <div id="completed-state" class="completed-state" style="display: none; text-align: center; padding: 40px;">
                            <h4>🎉 Great job!</h4>
                            <p>You've completed all cards in this session.</p>
                            <button class="btn btn-primary" onclick="location.reload()">Start New Session</button>
                        </div>
                    </div>
                   </div>
                </div>

            </div>
        </div>
    </div>


<script>
<?php if($user): ?>
// Flashcard Application State
const FlashcardApp = {
    user_id: <?php echo isset($user['id']) ? $user['id'] : 'null'; ?>,
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    isLoading: false,
    language_id: null,
    deck_id: null,
    learningStats: null,

    // Initialize the application
    init: function() {
        // Check for URL parameters to pre-select language and deck
        const urlParams = new URLSearchParams(window.location.search);
        const urlLanguageId = urlParams.get('language_id');
        const urlDeckId = urlParams.get('deck_id');
        
        if (urlLanguageId && urlDeckId) {
            this.language_id = parseInt(urlLanguageId);
            this.deck_id = parseInt(urlDeckId);
        }
        
        this.loadLanguages();
        this.setupEventListeners();
        
        // If URL parameters are provided, auto-select and start
        if (urlLanguageId && urlDeckId) {
            // Wait for languages to load, then select
            setTimeout(() => {
                $('#language-select').val(urlLanguageId).trigger('change');
                setTimeout(() => {
                    $('#deck-select').val(urlDeckId).trigger('change');
                    // Auto-start learning after a short delay
                    setTimeout(() => {
                        if ($('#btn-start-learning').length && !$('#btn-start-learning').prop('disabled')) {
                            $('#btn-start-learning').click();
                        }
                    }, 500);
                }, 500);
            }, 500);
        }
    },


    // Load languages from API
    loadLanguages: function() {
        $.ajax({
            url: 'api/vocab-learning/get-languages.php',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                if (response.success && response.languages) {
                    const select = $('#language-select');
                    response.languages.forEach(lang => {
                        select.append(`<option value="${lang.id}" data-name="${(lang.name || '').toLowerCase()}">${lang.name}</option>`);
                    });
                }
            },
            error: () => {
                alert('Failed to load languages. Please refresh the page.');
            }
        });
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Language selection
        $('#language-select').on('change', () => {
            const languageId = $('#language-select').val();
            if (languageId) {
                this.loadDecks(languageId);
                this.language_id = languageId;
                this.updateSelectorStatus('#language-select');
            } else {
                $('#deck-select').html('<option value="">-- Select Deck --</option>').prop('disabled', true);
                $('#btn-start-learning').prop('disabled', true);
                this.updateSelectorStatus('#language-select', false);
            }
        });

        // Deck selection
        $('#deck-select').on('change', () => {
            this.deck_id = $('#deck-select').val();
            $('#btn-start-learning').prop('disabled', !this.deck_id);
            this.updateSelectorStatus('#deck-select');
        });

        // Start learning button
        $('#btn-start-learning').on('click', () => {
            this.startLearning();
        });

        // Show answer button
        $('#btn-show-answer').on('click', () => {
            this.flipCard();
        });

        // Rating buttons
        $('.rating-btn').on('click', (e) => {
            if (!this.isLoading) {
                const rating = $(e.target).data('rating');
                this.rateCard(rating);
            }
        });

        // Skip button
        $('#btn-skip').on('click', () => {
            if (!this.isLoading) {
                this.showSkipConfirmation();
            }
        });

    },

    // Load decks for selected language
    loadDecks: function(languageId) {
        $.ajax({
            url: 'api/vocab-learning/get-decks.php',
            method: 'GET',
            data: { language_id: languageId },
            dataType: 'json',
            success: (response) => {
                const select = $('#deck-select');
                select.html('<option value="">-- Select Deck --</option>');
                if (response.success && response.decks) {
                    response.decks.forEach(deck => {
                        select.append(`<option value="${deck.id}">${deck.title}</option>`);
                    });
                    select.prop('disabled', false);
                    // Reset deck selector status
                    this.updateSelectorStatus('#deck-select', false);
                } else {
                    select.prop('disabled', true);
                    this.updateSelectorStatus('#deck-select', false);
                }
            },
            error: () => {
                alert('Failed to load decks. Please try again.');
            }
        });
    },

    // Start learning session
    startLearning: function() {
        this.showSkeletonLoader();
        this.hideAllStates();

        $.ajax({
            url: 'api/vocab-learning/get-cards.php',
            method: 'GET',
            data: {
                user_id: this.user_id,
                language_id: this.language_id,
                deck_id: this.deck_id
            },
            dataType: 'json',
            success: (response) => {
                this.hideSkeletonLoader();
                
                if (response.success && response.data && response.data.words) {
                    this.cards = response.data.words;
                    this.learningStats = response.data;
                    
                    if (this.cards.length > 0) {
                        this.displayCard();
                        this.updateProgress();
                        this.updateStats();
                        $('.flashcard-header').show();
                    } else {
                        this.showEmptyState();
                    }
                } else {
                    alert(response.message || 'No cards available for this deck.');
                    this.showEmptyState();
                }
            },
            error: (xhr, status, error) => {
                this.hideSkeletonLoader();
                alert('Failed to load cards. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Display current card
    displayCard: function() {
        if (this.currentIndex >= this.cards.length) {
            this.showCompletedState();
            return;
        }

        const card = this.cards[this.currentIndex];
        const cardData = card.card || card;
        const richData = card.rich_data || {};

        // Reset card to front
        this.isFlipped = false;
        $('#flashcard').removeClass('flipped');
        $('#flashcard-front').show();
        $('#flashcard-back').hide();


        // Set front side content
        $('#card-word').text(cardData.word || '');
        $('#card-ipa').text(richData.ipa || '');

        // Set back side content
        $('#back-card-word').text(cardData.word || '');
        $('#back-card-ipa').text(richData.ipa || '');
        $('#card-translation').text(richData.burmese_translation || cardData.burmese_translation || '');

        // Display examples
        let examplesHtml = '';
        if (richData.example_sentences && Array.isArray(richData.example_sentences)) {
            richData.example_sentences.forEach(example => {
                if (example) examplesHtml += `<div class="example">${example}</div>`;
            });
        } else if (cardData.example_sentences) {
            try {
                const examples = JSON.parse(cardData.example_sentences);
                if (Array.isArray(examples)) {
                    examples.forEach(example => {
                        if (example) examplesHtml += `<div class="example">${example}</div>`;
                    });
                }
            } catch (e) {
                // Not JSON, use as is
                examplesHtml = `<div class="example">${cardData.example_sentences}</div>`;
            }
        }
        $('#card-examples').html(examplesHtml || '');

        // Show flashcard
        $('#flashcard-wrapper').show();
        this.updateProgress();
        
    },

    // Flip card to show answer
    flipCard: function() {
        if (this.isFlipped) return;
        
        this.isFlipped = true;
        $('#flashcard').addClass('flipped');
        $('#flashcard-front').hide();
        $('#flashcard-back').show();
    },

    // Rate card
    rateCard: function(rating) {
        if (this.isLoading) return;

        const card = this.cards[this.currentIndex];
        const cardId = card.card ? card.card.id : card.id;

        this.showLoading();
        this.disableButtons();

        $.ajax({
            url: 'api/vocab-learning/rate-word.php',
            method: 'POST',
            data: {
                user_id: this.user_id,
                card_id: cardId,
                quality: rating
            },
            dataType: 'json',
            success: (response) => {
                this.hideLoading();
                this.enableButtons();

                if (response.success) {
                    // Move to next card
                    this.currentIndex++;
                    if (this.currentIndex < this.cards.length) {
                        this.displayCard();
                    } else {
                        this.showCompletedState();
                    }
                } else {
                    alert(response.message || 'Failed to save rating. Please try again.');
                }
            },
            error: (xhr, status, error) => {
                this.hideLoading();
                this.enableButtons();
                alert('Failed to save rating. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Show skip confirmation dialog
    showSkipConfirmation: function() {
        $('#skip-confirmation-dialog').fadeIn(200);
        
        // Handle cancel button
        $('#skip-dialog-cancel').off('click').on('click', () => {
            this.hideSkipConfirmation();
        });
        
        // Handle OK button
        $('#skip-dialog-ok').off('click').on('click', () => {
            this.hideSkipConfirmation();
            this.skipCard();
        });
        
        // Close on overlay click
        $('.skip-dialog-overlay').off('click').on('click', () => {
            this.hideSkipConfirmation();
        });
        
        // Close on ESC key
        $(document).off('keydown.skipDialog').on('keydown.skipDialog', (e) => {
            if (e.key === 'Escape') {
                this.hideSkipConfirmation();
            }
        });
    },

    // Hide skip confirmation dialog
    hideSkipConfirmation: function() {
        $('#skip-confirmation-dialog').fadeOut(200);
        $(document).off('keydown.skipDialog');
    },

    // Skip card
    skipCard: function() {
        if (this.isLoading) return;

        const card = this.cards[this.currentIndex];
        const cardId = card.card ? card.card.id : card.id;

        // Get all card IDs in current session
        const sessionCardIds = this.cards.map(c => (c.card ? c.card.id : c.id));

        this.showLoading();
        this.disableButtons();

        $.ajax({
            url: 'api/vocab-learning/skip-word.php',
            method: 'POST',
            data: {
                user_id: this.user_id,
                card_id: cardId,
                language_id: this.language_id,
                deck_id: this.deck_id,
                session_card_ids: JSON.stringify(sessionCardIds)
            },
            dataType: 'json',
            success: (response) => {
                this.hideLoading();
                this.enableButtons();

                if (response.success) {
                    // Replace current card with replacement word
                    if (response.data && response.data.replacement_word) {
                        this.cards[this.currentIndex] = response.data.replacement_word;
                        this.displayCard();
                    } else {
                        // No replacement, move to next
                        this.currentIndex++;
                        if (this.currentIndex < this.cards.length) {
                            this.displayCard();
                        } else {
                            this.showCompletedState();
                        }
                    }
                } else {
                    alert(response.message || 'Failed to skip word. Please try again.');
                }
            },
            error: (xhr, status, error) => {
                this.hideLoading();
                this.enableButtons();
                alert('Failed to skip word. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Update progress indicator
    updateProgress: function() {
        $('#current-card-num').text(this.currentIndex + 1);
        $('#total-cards').text(this.cards.length);
    },

    // Update learning stats
    updateStats: function() {
        if (this.learningStats) {
            $('#learning-day-num').text(this.learningStats.learning_day_number || '-');
            if (this.learningStats.word_counts) {
                $('#new-words-count').text(this.learningStats.word_counts.new_words || 0);
                $('#recall-words-count').text(this.learningStats.word_counts.recall_words || 0);
            }
        }
    },

    // Show/hide states
    showSkeletonLoader: function() {
        $('#skeleton-loader').show();
        this.hideAllStates();
    },

    hideSkeletonLoader: function() {
        $('#skeleton-loader').hide();
    },

    showEmptyState: function() {
        $('#empty-state').show();
        $('#flashcard-wrapper').hide();
        $('.flashcard-header').hide();
    },

    showCompletedState: function() {
        $('#completed-state').show();
        $('#flashcard-wrapper').hide();
    },

    hideAllStates: function() {
        $('#skeleton-loader').hide();
        $('#flashcard-wrapper').hide();
        $('#empty-state').hide();
        $('#completed-state').hide();
    },

    showLoading: function() {
        this.isLoading = true;
        $('#loading-overlay').show();
    },

    hideLoading: function() {
        this.isLoading = false;
        $('#loading-overlay').hide();
    },

    disableButtons: function() {
        $('.rating-btn, #btn-skip').prop('disabled', true);
    },

    enableButtons: function() {
        $('.rating-btn, #btn-skip').prop('disabled', false);
    },

    // Update selector status indicator
    updateSelectorStatus: function(selector, hasValue = true) {
        const $select = $(selector);
        const $status = $select.closest('.selector-group').find('.selector-status');
        
        if (hasValue && $select.val()) {
            $status.css({
                'background': '#27ae60',
                'box-shadow': '0 0 8px rgba(39, 174, 96, 0.5)'
            });
        } else {
            $status.css({
                'background': '#95a5a6',
                'box-shadow': 'none'
            });
        }
    },

};
<?php endif; ?>

// Initialize when document is ready
$(document).ready(function() {
    <?php if($user): ?>
    FlashcardApp.init();
    <?php endif; ?>
});
</script>

<?php 
    include('layouts/footer.php');
?>