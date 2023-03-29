const MailchimpSignupForm = () => {
    return (
    <>
        {/* Begin Mailchimp Signup Form */}
        <link href="//cdn-images.mailchimp.com/embedcode/classic-071822.css" rel="stylesheet" type="text/css" />
        <div id="mc_embed_signup" style={{background:"rgba(255,255,255,.111);", color:"white", clear:"left", font:"14px Helvetica,Arial,sans-serif", width:"100%", borderRadius: "12px", margin: "2em"}}>
          <form action="https://mztwarriors.us21.list-manage.com/subscribe/post?u=8ac8a2a79b4afbbcf66e99a7d&amp;id=ca2bd3fb62&amp;f_id=00b2abe1f0" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate style={{margin:"0", padding: "1em 2.25em"}}>
            <div id="mc_embed_signup_scroll">
              <h2>Sign-up for the Tribal Newsletter</h2>
              <div className="indicates-required"><span className="asterisk">*</span> indicates required</div>
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">Email Address  <span className="asterisk">*</span></label>
                <input type="email" defaultValue="" name="EMAIL" className="required email" id="mce-EMAIL" required style={{color:"black"}}/>
                <span id="mce-EMAIL-HELPERTEXT" className="helper_text" style={{background:"none"}}></span>
              </div>
              <div id="mce-responses" className="clear foot" style={{margin: "0", padding: "0"}}>
                <div className="response" id="mce-error-response" style={{display: 'none', background: 'none'}}></div>
                <div className="response" id="mce-success-response" style={{display: 'none', color: '#59f95e'}}></div>
              </div>
              {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups */}
              <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
                <input type="text" name="b_8ac8a2a79b4afbbcf66e99a7d_ca2bd3fb62" tabIndex="-1" value="" />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input type="submit" value="Sign Up" name="subscribe" id="mc-embedded-subscribe" className="button" style={{background: "#17dc6a", color: "black", fontWeight: "bolder"}}/>
                </div>
              </div>
            </div>
          </form>
        </div>
        <script src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js' type='text/javascript' async />
        <script dangerouslySetInnerHTML={{__html: `(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[3]='MMERGE3';ftypes[3]='dropdown';fnames[4]='MMERGE4';ftypes[4]='text';fnames[5]='MMERGE5';ftypes[5]='text';fnames[6]='MMERGE6';ftypes[6]='text';fnames[7]='MMERGE7';ftypes[7]='text';fnames[8]='MMERGE8';ftypes[8]='text';fnames[9]='MMERGE9';ftypes[9]='text';fnames[10]='MMERGE10';ftypes[10]='text';fnames[11]='MMERGE11';ftypes[11]='text';}(jQuery));`}} />
    </>)}
  export default MailchimpSignupForm;
