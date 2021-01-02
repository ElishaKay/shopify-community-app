exports.newsFeedCSS = ({shop}) => {
    const backupHeaderImg = "https://www.dorothylane.com/wp-content/uploads/2017/09/cheese.jpg";

    return `${shop.CSSCode}
             .community-background { background-color: ${shop && shop.backgroundColor ? shop.backgroundColor : '#543434' }; }
             .community-header { background-image: url(${shop && shop.headerImageURL ? shop.headerImageURL : backupHeaderImg}); }
             .community-card-header { background:${shop && shop.primaryColor ? shop.primaryColor : '#26b598'}; }
             .community-instant-post { border:1px solid ${shop && shop.backgroundColor ? shop.backgroundColor : '#edeff1'}; }
        `;
};
