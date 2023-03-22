function UnityProgress(unityInstance, progress) {
	if (!unityInstance.Module)
		return;
	
	if (!unityInstance.logo)
	{
		unityInstance.logo = document.getElementById("custom-logo");
		unityInstance.logo.style.display = "block";
		unityInstance.container.appendChild(unityInstance.logo);
	}

	if (!unityInstance.progress)
	{
		unityInstance.progress = document.getElementById("custom-loader");
		unityInstance.progress.style.display = "block";
		unityInstance.container.appendChild(unityInstance.progress);
	}

	setLoaderProgressTo(progress);

	if (progress == 1)
	{
		unityInstance.logo.style.display = "none";
		unityInstance.progress.style.display = "none";
	}
	
	// value - 0 to 1
	function setLoaderProgressTo(value)
	{
	  const fill = unityInstance.progress.getElementsByClassName("progressBar")[0];
	  const fillText = unityInstance.progress.getElementsByClassName("progressLabel")[0];

	  fill.animate(
		[
		  { width: (value * 100) + "%" }
		],
		{
		  duration: 300,
		  fill: "forwards"
		}
	  );

	  fillText.textContent = (value * 100).toFixed() + "%";
	}

	// Check if the device is mobile
	if (/Mobi/.test(navigator.userAgent)) { 
		if (!unityInstance.mobileLogo) {
			unityInstance.mobileLogo = document.getElementById("alert-custom-logo");
			unityInstance.mobileLogo.style.display = "block";
			unityInstance.container.appendChild(unityInstance.mobileLogo);


		    console.log("Creating button image...");
		   	const playButtonImg = document.getElementById("alert-custom-button");
		    playButtonImg.style.display = "block";
		    playButtonImg.addEventListener("click", function() {
		     	window.location.href = "https://app.openbisea.com/motoDEX";
		    	playButtonImg.style.display = "none";
		    });
		    unityInstance.container.appendChild(playButtonImg);
		}

		// Hide the desktop logo and progress bar
		unityInstance.logo.style.display = "none";
		unityInstance.progress.style.display = "none";
	}
}