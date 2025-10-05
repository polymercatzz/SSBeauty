let cancelBtn;
        function openCancelModal(appointment_id) {
            let cancelModal = document.getElementById(`cancelModal-${appointment_id}`);
            cancelModal.classList.remove('hidden');
        }

        function closeCancelModal(appointment_id) {
            let cancelModal = document.getElementById(`cancelModal-${appointment_id}`);
            cancelModal.classList.add('hidden');
        }

        function confirmCancel(appointment_id) {
            const appointmentId = appointment_id;
            fetch(`/user/history/${appointmentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'canceled' }),
            }).then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('เกิดข้อผิดพลาดในการยกเลิกการจอง1');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการยกเลิกการจอง2');
            });
            closeCancelModal();
        }