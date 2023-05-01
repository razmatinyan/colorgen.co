<template>
	<section id="contact">
		<div class="container">
			<h1 class="contact-title big-title text-center">Contact</h1>
			<p class="contact-descr">We would love to hear from you! If you have any questions, comments, or feedback about our website, please don't hesitate to contact us using the form below.</p>

			<div class="form">
				<form
						id="form"
						action="https://formspree.io/f/xrgvewgr"
						method="POST"
						@submit.prevent="FormHandler($event)"
					>
						<div class="form-row first-row">
							<label for="name">What's your name?</label>
							<input v-model="name" id="name" type="text" class="field" name="name" required  placeholder="Raz Matinyan *" />
						</div>
						<div class="form-row second-row">
							<label for="email">What's your email?</label>
							<input v-model="email" id="email" type="email" class="field" name="email" required  placeholder="razmatinyan28@gmail.com" />
						</div>
						<div class="form-row third-row">
							<label for="message">Your message</label>
							<textarea v-model="message" id="message" type="text" class="field" name="message" rows="7" required placeholder="Hello. Can you help me with... *"></textarea>
						</div>
						<div class="form-button">
							<button id="random-btn" :disabled="disableButton" class="gnr-btn btn btn-medium btn-blue btn-min-width-200">Submit</button>
						</div>
					</form>
			</div>
		</div>

        <Teleport to="body">
            <Modal ref="modal" :modalTitle="customModalTitle">
                <template #content>
                    <p class="content-text">
                        {{ formResult }}
                    </p>
                </template>
            </Modal>
        </Teleport>

	</section>
</template>

<script setup>
const modal = ref('');
const customModalTitle = ref('');
const name = ref('');
const email = ref('');
const message = ref('');
const disableButton = ref(false);
const formResult = ref('');

async function FormHandler(event) {

	console.log(event);

	var form = document.getElementById(event.target.id);
	var data = new FormData(event.target);

	fetch(event.target.action, {
		method: form.method,
		body: data,
		headers: {
			Accept: "application/json",
		},
	})
	.then((response) => {
		modal.value.showModal = true

		if (response.ok) {
			customModalTitle.value = 'Thank you!'
			formResult.value = 'We will answer you as soon as possible!'
			resetForm();
		} else {
			customModalTitle.title = "Oops..."
			formResult.value = "There was a problem while submitting your form. Try again later."
		}

	})
	.catch((error) => {
		modal.value.showModal = true
		customModalTitle.title = "Oops..."
		formResult.value = "There was a problem while submitting your form. Try again later."
	});
	
}

function resetForm() {
	name.value = ''
	email.value = ''
	message.value = ''
}
</script>

<style scoped>
#contact {
	padding-top: 70px;
	padding-bottom: 70px;
}
.contact-title {
	margin-bottom: 34px;
}
.contact-descr {
	max-width: 900px;
	margin: 0 auto;
	margin-bottom: 34px;
	color: var(--gray-3);
	text-align: center;
}
#form {
	display: flex;
	flex-wrap: wrap;
	max-width: 600px;
	margin: 0 auto;
}
.form-row {
	margin-bottom: 30px;
}
.form-row.first-row {
	flex-basis: 50%;
	padding-right: 10px;
}
.form-row.second-row {
	flex-basis: 50%;
	padding-left: 10px;
}
.form-row.third-row {
	flex-basis: 100%;
}
.form-row > label {
	display: block;
	margin-bottom: 6px;
	font-size: 14px;
}
.form-row > input {
	width: 100%;
}
.form-row > textarea {
	width: 100%;
}
.form-button {
	display: flex;
	justify-content: center;
	width: 100%;
}
.form-button > button {
	width: max-content;
}

.content-text {
    text-align: center;
    font-size: 18px;
}
</style>