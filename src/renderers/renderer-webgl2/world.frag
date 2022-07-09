precision mediump float;

// Require resolution (canvas size) as an input
uniform vec3 uResolution;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(){
	// Calculate relative coordinates (uv)
	// vec2 uv=gl_FragCoord.xy/uResolution.xy;
	// gl_FragColor=vec4(uv.x,uv.y,0.,1.);
	
	gl_FragColor=texture2D(uSampler,vTextureCoord);
}
