const gradeItems = {
    1: "Rice",
    2: "Sugar",
    3: "Wheat",
    4: "Dal",
    5: "Oil",
    6: "Salt",
    7: "Flour",
    8: "Pulses",
    9: "Rice",
    10: "Sugar",
    11: "Wheat",
    12: "Dal"
};

document.getElementById("grade")
    .addEventListener("change", function () {
        const grade = this.value;
        const itemDropdown = document.getElementById("item");
        itemDropdown.innerHTML ='<option value="">Select Item</option>';
        if (grade && gradeItems[grade]) {
            const option =document.createElement("option");
            option.value =gradeItems[grade];
            option.textContent =gradeItems[grade];
            itemDropdown.appendChild(option);
        }
    });

document.getElementById("donationForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        const month =document.getElementById("month").value;
        const grade =document.getElementById("grade").value;
        const item =document.getElementById("item").value;
        const quantity =parseFloat(document.getElementById("quantity").value);
        const unit = document.getElementById("unit").value;
         const donation = {
            id: Date.now(),
            month: month,
            grade: grade,
            item: item,
            quantity: quantity,
            unit: unit
        };

        // Get existing donations
        const donations =
            JSON.parse(
                localStorage.getItem("donations")
            ) || [];

        // Add new donation
        donations.push(donation);
        // Save
        localStorage.setItem(
            "donations",
            JSON.stringify(donations)
        );
        document.getElementById("message").textContent ="Donation saved successfully.";
        this.reset();
    });    

    // Generate report 
    function generateReport() {
    const selectedMonth =document.getElementById("reportMonth").value;
    if (!selectedMonth) {
        alert("Please select a month.");
        return;
    }
    const donations =JSON.parse(localStorage.getItem("donations")) || [];
    const monthDonations =
        donations.filter(
            donation =>
                donation.month === selectedMonth
        );
    const reportBody = document.getElementById("reportBody");
    reportBody.innerHTML = "";
    let grandTotal = 0;
    monthDonations.forEach(
        donation => {
            const row =
                document.createElement("tr");
            row.innerHTML = `
                <td>
                    Grade ${donation.grade}
                </td>
                <td>
                    ${donation.item}
                </td>
                <td>
                    ${donation.quantity}
                </td>
                <td>
                    ${donation.unit}
                </td>
            `;
            reportBody.appendChild(row);
            grandTotal +=donation.quantity;

        }
    );
    document.getElementById("grandTotal")
        .textContent =
        grandTotal;

}
function showSection(sectionId) {
    document.getElementById("donationSection").style.display = "none";
    document.getElementById("reportSection").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}